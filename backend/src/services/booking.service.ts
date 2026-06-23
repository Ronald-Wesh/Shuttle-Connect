import { BOOKING_STATUS, PAYMENT_STATUS } from "../constants/bookingStatus";
import {
  hasPermission,
  PERMISSIONS
} from "../constants/permissions";
import { ROLES } from "../constants/roles";
import { TRIP_STATUS } from "../constants/tripStatus";
import type { AuthenticatedUser } from "../interfaces/auth.interface";
import type {
  CancelBookingInput,
  CreateBookingInput
} from "../interfaces/booking.interface";
import {
  assertCompanyAccess,
  resolveCompanyId
} from "../middleware/company.middleware";
import { bookingRepository } from "../repositories/booking.repository";
import { passengerRepository } from "../repositories/passenger.repository";
import { tripRepository } from "../repositories/trip.repository";
import { mpesaService } from "./mpesa.service";
import { auditService } from "./audit.service";
import { notificationService } from "./notification.service";
import { conflict, forbidden, notFound } from "../utils/httpError";
import { generateBookingReference } from "../utils/generateReference";
import { getPagination, getPaginationMeta } from "../utils/pagination";

export class BookingService {
  async create(input: CreateBookingInput, user: AuthenticatedUser) {
    const trip = await tripRepository.findById(input.tripId);

    if (!trip) {
      throw notFound("Trip not found");
    }

    if (![TRIP_STATUS.SCHEDULED, TRIP_STATUS.BOARDING].includes(trip.status)) {
      throw conflict("Bookings are not open for this trip");
    }

    const canCreateCompanyBooking = hasPermission(
      user.role,
      PERMISSIONS.BOOKING_CREATE_COMPANY
    );
    const canCreateOwnBooking = hasPermission(
      user.role,
      PERMISSIONS.BOOKING_CREATE_OWN
    );

    if (canCreateCompanyBooking) {
      assertCompanyAccess(user, trip.company_id);
    } else if (!canCreateOwnBooking) {
      throw forbidden("Your role cannot create bookings");
    }

    if (Number(trip.available_seats) < input.seatCount) {
      throw conflict("Not enough seats are available for this trip");
    }

    const passenger = input.passengerId
      ? await passengerRepository.findById(input.passengerId, trip.company_id)
      : await passengerRepository.create({
          company_id: trip.company_id,
          user_id: canCreateCompanyBooking ? null : user.id,
          full_name: input.passenger!.fullName,
          phone: input.passenger!.phone,
          email: input.passenger!.email ?? null,
          national_id: input.passenger!.nationalId ?? null
        });

    if (!passenger) {
      throw notFound("Passenger not found for this company");
    }

    if (!canCreateCompanyBooking && passenger.user_id !== user.id) {
      throw forbidden("You can only create bookings for your own passenger profile");
    }

    const totalAmount = Number(trip.fare_amount) * input.seatCount;
    const booking = await bookingRepository.create({
      company_id: trip.company_id,
      trip_id: input.tripId,
      passenger_id: passenger.id,
      booking_reference: generateBookingReference(),
      seat_count: input.seatCount,
      total_amount: totalAmount,
      status: BOOKING_STATUS.PENDING,
      payment_status: PAYMENT_STATUS.PENDING
    });

    await auditService.log({
      companyId: trip.company_id,
      actorId: user.id,
      action: "booking.created",
      entityType: "booking",
      entityId: booking.id,
      metadata: {
        bookingReference: booking.booking_reference,
        seatCount: input.seatCount
      }
    });

    await notificationService.create({
      companyId: trip.company_id,
      recipientUserId: passenger.user_id ?? undefined,
      recipientPhone: passenger.phone,
      title: "Booking created",
      message: `Booking ${booking.booking_reference} is pending confirmation.`,
      metadata: {
        bookingId: booking.id,
        bookingReference: booking.booking_reference
      }
    });

    return booking;
  }

  async list(
    user: AuthenticatedUser,
    query: Record<string, unknown> & {
      companyId?: string;
      passengerId?: string;
      tripId?: string;
      status?: string;
    }
  ) {
    const { page, limit, from, to } = getPagination(query);

    if (hasPermission(user.role, PERMISSIONS.BOOKING_READ_COMPANY)) {
      const companyId = resolveCompanyId(user, query.companyId) as string;

      const result = await bookingRepository.findAll({
        companyId,
        passengerId: query.passengerId,
        tripId: query.tripId,
        status: query.status,
        from,
        to
      });

      return {
        bookings: result.data,
        meta: getPaginationMeta(page, limit, result.count)
      };
    }

    if (hasPermission(user.role, PERMISSIONS.BOOKING_READ_OWN)) {
      const passengerIds = await passengerRepository.findIdsByUser(user.id);
      const result = await bookingRepository.findAllForPassengers({
        passengerIds,
        tripId: query.tripId,
        status: query.status,
        from,
        to
      });

      return {
        bookings: result.data,
        meta: getPaginationMeta(page, limit, result.count)
      };
    }

    throw forbidden("Your role cannot view bookings");
  }

  async getById(id: string, user: AuthenticatedUser) {
    if (hasPermission(user.role, PERMISSIONS.BOOKING_READ_COMPANY)) {
      const companyId =
        user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user);
      const booking = await bookingRepository.findById(id, companyId);

      if (!booking) {
        throw notFound("Booking not found");
      }

      assertCompanyAccess(user, booking.company_id);
      return booking;
    }

    if (hasPermission(user.role, PERMISSIONS.BOOKING_READ_OWN)) {
      const passengerIds = await passengerRepository.findIdsByUser(user.id);
      const booking = await bookingRepository.findByIdForPassengers(
        id,
        passengerIds
      );

      if (!booking) {
        throw notFound("Booking not found");
      }

      return booking;
    }

    throw forbidden("Your role cannot view this booking");
  }

  async initiatePayment(bookingId: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw notFound("Booking not found");
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw conflict("Only pending bookings can be paid for");
    }

    const phone = booking.passenger?.phone;

    if (!phone) {
      throw conflict("Booking passenger phone number is missing");
    }

    const amount = Number(booking.total_amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw conflict("Booking amount is invalid");
    }

    const stkPush = await mpesaService.initiateSTKPush({
      phone,
      amount,
      bookingId: booking.booking_reference,
      description: `Booking payment for ${booking.booking_reference}`
    });

    await bookingRepository.update(booking.id, booking.company_id, {
      checkout_request_id: stkPush.CheckoutRequestID,
      payment_status: PAYMENT_STATUS.PENDING,
      payment_failed_reason: null
    });

    return stkPush;
  }

  async confirmBooking(bookingId: string, mpesaReceipt: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw notFound("Booking not found");
    }

    await bookingRepository.confirm(booking.id, null);

    return bookingRepository.update(booking.id, booking.company_id, {
      payment_status: PAYMENT_STATUS.PAID,
      mpesa_receipt: mpesaReceipt,
      payment_failed_reason: null
    });
  }

  async failBooking(bookingId: string, reason: string) {
    const booking = await bookingRepository.findById(bookingId);

    if (!booking) {
      throw notFound("Booking not found");
    }

    return bookingRepository.update(booking.id, booking.company_id, {
      payment_status: PAYMENT_STATUS.FAILED,
      payment_failed_reason: reason
    });
  }

  async confirm(id: string, user: AuthenticatedUser) {
    const companyId =
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user);
    const existingBooking = await bookingRepository.findById(id, companyId);

    if (!existingBooking) {
      throw notFound("Booking not found");
    }

    assertCompanyAccess(user, existingBooking.company_id);
    const booking = await bookingRepository.confirm(id, user.id);

    await auditService.log({
      companyId: existingBooking.company_id,
      actorId: user.id,
      action: "booking.confirmed",
      entityType: "booking",
      entityId: id
    });

    return booking;
  }

  async cancel(
    id: string,
    input: CancelBookingInput,
    user: AuthenticatedUser
  ) {
    const canCancelCompanyBooking = hasPermission(
      user.role,
      PERMISSIONS.BOOKING_CANCEL_COMPANY
    );

    if (canCancelCompanyBooking) {
      const companyId =
        user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user);
      const existingBooking = await bookingRepository.findById(id, companyId);

      if (!existingBooking) {
        throw notFound("Booking not found");
      }

      assertCompanyAccess(user, existingBooking.company_id);
      const booking = await bookingRepository.cancel(id, user.id, input.reason);

      await auditService.log({
        companyId: existingBooking.company_id,
        actorId: user.id,
        action: "booking.cancelled",
        entityType: "booking",
        entityId: id,
        metadata: { reason: input.reason }
      });

      return booking;
    }

    if (hasPermission(user.role, PERMISSIONS.BOOKING_CANCEL_OWN)) {
      const passengerIds = await passengerRepository.findIdsByUser(user.id);
      const existingBooking = await bookingRepository.findByIdForPassengers(
        id,
        passengerIds
      );

      if (!existingBooking) {
        throw notFound("Booking not found");
      }

      const booking = await bookingRepository.cancel(id, user.id, input.reason);

      await auditService.log({
        companyId: existingBooking.company_id,
        actorId: user.id,
        action: "booking.cancelled",
        entityType: "booking",
        entityId: id,
        metadata: { reason: input.reason }
      });

      return booking;
    }

    throw forbidden("Your role cannot cancel bookings");
  }
}

export const bookingService = new BookingService();
