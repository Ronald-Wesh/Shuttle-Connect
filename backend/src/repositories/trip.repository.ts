import { supabase } from "../config/supabase";
import { throwDatabaseError } from "./repositoryUtils";

interface ListTripsFilters {
  companyId?: string;
  vehicleId?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  status?: string;
  from: number;
  to: number;
}

export class TripRepository {
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("trips")
      .insert(payload)
      .select("*, route:routes!trips_route_company_fkey(*), vehicle:vehicles!trips_vehicle_company_fkey(*)")
      .single();

    throwDatabaseError(error);
    return data;
  }

  async findAll(filters: ListTripsFilters) {
    let query = supabase
      .from("trips")
      .select("*, route:routes!trips_route_company_fkey!inner(*), vehicle:vehicles!trips_vehicle_company_fkey(*)", { count: "exact" })
      .order("departure_time", { ascending: true });

    if (filters.companyId) {
      query = query.eq("company_id", filters.companyId);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.vehicleId) {
      query = query.eq("vehicle_id", filters.vehicleId);
    }

    if (filters.origin) {
      query = query.ilike("routes.origin", `%${filters.origin}%`);
    }

    if (filters.destination) {
      query = query.ilike("routes.destination", `%${filters.destination}%`);
    }

    if (filters.departureDate) {
      const start = new Date(filters.departureDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      query = query
        .gte("departure_time", start.toISOString())
        .lt("departure_time", end.toISOString());
    }

    const { data, error, count } = await query.range(filters.from, filters.to);

    throwDatabaseError(error);
    return { data: data ?? [], count };
  }

  async findById(id: string, companyId?: string) {
    let query = supabase
      .from("trips")
      .select("*, route:routes!trips_route_company_fkey(*), vehicle:vehicles!trips_vehicle_company_fkey(*)")
      .eq("id", id);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query.maybeSingle();

    throwDatabaseError(error);
    return data;
  }

  async update(id: string, companyId: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("trips")
      .update(payload)
      .eq("id", id)
      .eq("company_id", companyId)
      .select("*, route:routes!trips_route_company_fkey(*), vehicle:vehicles!trips_vehicle_company_fkey(*)")
      .single();

    throwDatabaseError(error);
    return data;
  }
}

export const tripRepository = new TripRepository();
