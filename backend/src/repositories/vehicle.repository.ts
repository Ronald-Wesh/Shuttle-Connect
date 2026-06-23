import { supabase } from "../config/supabase";
import { throwDatabaseError } from "./repositoryUtils";

interface ListVehiclesFilters {
  companyId?: string;
  search?: string;
  status?: string;
  from: number;
  to: number;
}

export class VehicleRepository {
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert(payload)
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }

  async findAll(filters: ListVehiclesFilters) {
    let query = supabase
      .from("vehicles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.companyId) {
      query = query.eq("company_id", filters.companyId);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,plate_number.ilike.%${filters.search}%,model.ilike.%${filters.search}%`
      );
    }

    const { data, error, count } = await query.range(filters.from, filters.to);

    throwDatabaseError(error);
    return { data: data ?? [], count };
  }

  async findById(id: string, companyId?: string) {
    let query = supabase.from("vehicles").select("*").eq("id", id);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query.maybeSingle();

    throwDatabaseError(error);
    return data;
  }

  async update(id: string, companyId: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("vehicles")
      .update(payload)
      .eq("id", id)
      .eq("company_id", companyId)
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }
}

export const vehicleRepository = new VehicleRepository();
