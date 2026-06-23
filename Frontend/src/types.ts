/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OperatorId = "mololine" | "north-rift" | "sharks";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
}

export interface AuthSessionUser {
  id: string;
  email?: string;
  phone?: string;
  appMetadata?: Record<string, unknown>;
  userMetadata?: Record<string, unknown>;
}

export interface AuthSession {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  user?: AuthSessionUser | null;
}

export interface AuthPayload {
  session: AuthSession | null;
  user: AuthSessionUser | null;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  contactPhone?: string;
  status?: string;
}

export interface Route {
  id: string;
  companyId?: string;
  name?: string;
  from: string;
  to: string;
  baseFare?: number;
  status?: string;
}

export interface Trip {
  id: string;
  routeId?: string;
  companyId?: string;
  from?: string;
  to?: string;
  fare: number;
  date?: string;
  departTime?: string;
  vehiclePlate?: string;
  status?: string;
}

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  companyId?: string;
}

export interface Notification {
  id: string;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  companyId?: string;
  timestamp?: string;
}

export interface AuditLog {
  id: string;
  action?: string;
  resource?: string;
  userId?: string;
  companyId?: string;
  timestamp?: string;
}

export interface Operator {
  id: OperatorId;
  name: string;
  subName: string;
  tagline: string;
  contactPhone: string;
  bgGradient: string;
  stats: {
    dailyRevenue: number;
    revenueGrowth: number;
    totalPassengers: number;
    utilization: number;
    totalVehicles: number;
  };
}

export type DepartureStatus = "LIVE" | "BOARDING" | "SCHEDULED" | "DEPARTED";

export interface Departure {
  id: string;
  operatorId: OperatorId;
  departTime: string;
  date: string;
  from: string;
  to: string;
  fare: number;
  vehiclePlate: string;
  vehicleType: string; // e.g. "14-Seater", "11-Seater"
  capacity: number;
  occupiedSeats: number[]; // e.g. [3, 7, 8, 12, 13, 16]
  status: DepartureStatus;
  driverName: string;
}

export interface Booking {
  id: string;
  departureId: string;
  passengerName: string;
  passengerPhone: string;
  seats: number[];
  amount: number;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  transactionId: string;
  timestamp: string;
  operatorId: OperatorId;
  status?: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  operatorId: OperatorId;
  amount: number;
  phone: string;
  passengerName: string;
  status: "SENT" | "SUCCESS" | "FAILED";
  timestamp: string;
  method: "M-PESA";
}

export interface RouteStats {
  from: string;
  to: string;
  baseFare: number;
  operatorId: OperatorId;
  popularity: number; // 0-100
  schedulesCount: number;
}
