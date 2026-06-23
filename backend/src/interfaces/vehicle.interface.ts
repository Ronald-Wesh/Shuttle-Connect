import type { VehicleStatus } from "../constants/vehicleStatus";

export interface Vehicle {
  id: string;
  company_id: string;
  name: string;
  plate_number: string;
  model?: string;
  seat_capacity: number;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleInput {
  companyId?: string;
  name: string;
  plateNumber: string;
  model?: string;
  seatCapacity: number;
  status?: VehicleStatus;
}

export interface UpdateVehicleInput {
  name?: string;
  plateNumber?: string;
  model?: string;
  seatCapacity?: number;
  status?: VehicleStatus;
}
