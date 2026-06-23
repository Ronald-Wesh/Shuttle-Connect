export interface ShuttleRoute {
  id: string;
  company_id: string;
  origin: string;
  destination: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRouteInput {
  companyId?: string;
  origin: string;
  destination: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
}

export interface UpdateRouteInput {
  origin?: string;
  destination?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  isActive?: boolean;
}
