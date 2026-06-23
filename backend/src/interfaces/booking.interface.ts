import type { BookingStatus, PaymentStatus } from "../constants/bookingStatus";

export interface Booking {
  id: string;
  company_id: string;
  trip_id: string;
  passenger_id: string;
  booking_reference: string;
  seat_count: number;
  total_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  checkout_request_id?: string | null;
  mpesa_receipt?: string | null;
  payment_failed_reason?: string | null;
  confirmed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingInput {
  tripId: string;
  passengerId?: string;
  passenger?: {
    fullName: string;
    phone: string;
    email?: string;
    nationalId?: string;
  };
  seatCount: number;
}

export interface CancelBookingInput {
  reason?: string;
}
