import { ROLES } from "../constants/roles";
import { TRIP_STATUS } from "../constants/tripStatus";
import { VEHICLE_STATUS } from "../constants/vehicleStatus";
import type { AuthenticatedUser } from "../interfaces/auth.interface";
import type { CreateTripInput, UpdateTripInput } from "../interfaces/trip.interface";
import {
  assertCompanyAccess,
  resolveCompanyId
} from "../middleware/company.middleware";
import { routeRepository } from "../repositories/route.repository";
import { tripRepository } from "../repositories/trip.repository";
import { vehicleRepository } from "../repositories/vehicle.repository";
import { auditService } from "./audit.service";
import { conflict, notFound } from "../utils/httpError";
import { getPagination, getPaginationMeta } from "../utils/pagination";

export class TripService {
  async create(input: CreateTripInput, user: AuthenticatedUser) {
    const companyId = resolveCompanyId(user, input.companyId);
    const route = await routeRepository.findById(input.routeId, companyId);

    if (!route) {
      throw notFound("Route not found for this company");
    }

    const vehicle = await vehicleRepository.findById(input.vehicleId, companyId);

    if (!vehicle) {
      throw notFound("Vehicle not found for this company");
    }

    if (vehicle.status !== VEHICLE_STATUS.ACTIVE) {
      throw conflict("Only active vehicles can be assigned to new trips");
    }

    const totalSeats =
      input.totalSeats ?? input.availableSeats ?? Number(vehicle.seat_capacity);

    if (totalSeats > Number(vehicle.seat_capacity)) {
      throw conflict("Trip seats cannot exceed the vehicle seat capacity");
    }

    const trip = await tripRepository.create({
      company_id: companyId,
      route_id: input.routeId,
      vehicle_id: input.vehicleId,
      vehicle_name: input.vehicleName ?? vehicle.name,
      vehicle_registration: input.vehicleRegistration ?? vehicle.plate_number,
      departure_time: input.departureTime,
      arrival_time: input.arrivalTime ?? null,
      fare_amount: input.fareAmount,
      total_seats: totalSeats,
      available_seats: totalSeats,
      status: TRIP_STATUS.SCHEDULED
    });

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "trip.created",
      entityType: "trip",
      entityId: trip.id
    });

    return trip;
  }

  async list(
    user: AuthenticatedUser,
    query: Record<string, unknown> & {
      companyId?: string;
      vehicleId?: string;
      origin?: string;
      destination?: string;
      departureDate?: string;
      status?: string;
    }
  ) {
    const requestedCompanyId =
      user.role === ROLES.SUPER_ADMIN ? query.companyId : undefined;
    const companyId =
      user.role === ROLES.SUPER_ADMIN
        ? resolveCompanyId(user, requestedCompanyId, {
            allowSuperAdminGlobal: true
          })
        : user.companyId
          ? resolveCompanyId(user, requestedCompanyId)
          : undefined;
    const { page, limit, from, to } = getPagination(query);

    const result = await tripRepository.findAll({
      companyId,
      vehicleId: query.vehicleId,
      origin: query.origin,
      destination: query.destination,
      departureDate: query.departureDate,
      status: query.status ?? (!user.companyId ? TRIP_STATUS.SCHEDULED : undefined),
      from,
      to
    });

    return {
      trips: result.data,
      meta: getPaginationMeta(page, limit, result.count)
    };
  }

  async getById(id: string, user: AuthenticatedUser) {
    const companyId =
      user.role === ROLES.SUPER_ADMIN || !user.companyId
        ? undefined
        : resolveCompanyId(user);
    const trip = await tripRepository.findById(id, companyId);

    if (!trip) {
      throw notFound("Trip not found");
    }

    return trip;
  }

  async update(id: string, input: UpdateTripInput, user: AuthenticatedUser) {
    const existingTrip = await tripRepository.findById(
      id,
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user)
    );

    if (!existingTrip) {
      throw notFound("Trip not found");
    }

    assertCompanyAccess(user, existingTrip.company_id);
    const companyId = existingTrip.company_id as string;

    if (input.routeId) {
      const route = await routeRepository.findById(input.routeId, companyId);

      if (!route) {
        throw notFound("Route not found for this company");
      }
    }

    let selectedVehicle:
      | Record<string, unknown>
      | null
      | undefined = undefined;

    if (input.vehicleId) {
      selectedVehicle = await vehicleRepository.findById(input.vehicleId, companyId);

      if (!selectedVehicle) {
        throw notFound("Vehicle not found for this company");
      }

      if (selectedVehicle.status !== VEHICLE_STATUS.ACTIVE) {
        throw conflict("Only active vehicles can be assigned to trips");
      }
    }

    const payload: Record<string, unknown> = {};

    if (input.routeId !== undefined) payload.route_id = input.routeId;
    if (input.vehicleId !== undefined) {
      payload.vehicle_id = input.vehicleId;
      if (input.vehicleName === undefined) payload.vehicle_name = selectedVehicle?.name;
      if (input.vehicleRegistration === undefined) {
        payload.vehicle_registration = selectedVehicle?.plate_number;
      }
    }
    if (input.vehicleName !== undefined) payload.vehicle_name = input.vehicleName;
    if (input.vehicleRegistration !== undefined) {
      payload.vehicle_registration = input.vehicleRegistration;
    }
    if (input.departureTime !== undefined) {
      payload.departure_time = input.departureTime;
    }
    if (input.arrivalTime !== undefined) payload.arrival_time = input.arrivalTime;
    if (input.fareAmount !== undefined) payload.fare_amount = input.fareAmount;
    if (input.status !== undefined) payload.status = input.status;

    const nextTotalSeats =
      input.totalSeats ??
      input.availableSeats ??
      (selectedVehicle ? Number(selectedVehicle.seat_capacity) : undefined);

    if (nextTotalSeats !== undefined) {
      const reservedSeats =
        Number(existingTrip.total_seats) - Number(existingTrip.available_seats);
      const vehicleCapacity = Number(
        selectedVehicle?.seat_capacity ?? existingTrip.vehicle?.seat_capacity
      );

      if (nextTotalSeats < reservedSeats) {
        throw conflict(
          `Total seats cannot be below the ${reservedSeats} already reserved seats`
        );
      }

      if (vehicleCapacity && nextTotalSeats > vehicleCapacity) {
        throw conflict("Trip seats cannot exceed the vehicle seat capacity");
      }

      payload.total_seats = nextTotalSeats;
      payload.available_seats = nextTotalSeats - reservedSeats;
    }

    const trip = await tripRepository.update(id, companyId, payload);

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "trip.updated",
      entityType: "trip",
      entityId: id,
      metadata: payload
    });

    return trip;
  }

  async cancel(id: string, user: AuthenticatedUser) {
    return this.update(id, { status: TRIP_STATUS.CANCELLED }, user);
  }
}

export const tripService = new TripService();
