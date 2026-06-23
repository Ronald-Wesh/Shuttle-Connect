import type { TripStatus } from "../constants/tripStatus";

export interface Trip {
  id: string;
  company_id: string;
  route_id: string;
  vehicle_id: string;
  vehicle_name?: string;
  vehicle_registration?: string;
  departure_time: string;
  arrival_time?: string;
  fare_amount: number;
  total_seats: number;
  available_seats: number;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTripInput {
  companyId?: string;
  routeId: string;
  vehicleId: string;
  vehicleName?: string;
  vehicleRegistration?: string;
  departureTime: string;
  arrivalTime?: string;
  fareAmount: number;
  totalSeats?: number;
  availableSeats?: number;
}

export interface UpdateTripInput {
  routeId?: string;
  vehicleId?: string;
  vehicleName?: string;
  vehicleRegistration?: string;
  departureTime?: string;
  arrivalTime?: string;
  fareAmount?: number;
  totalSeats?: number;
  availableSeats?: number;
  status?: TripStatus;
}
