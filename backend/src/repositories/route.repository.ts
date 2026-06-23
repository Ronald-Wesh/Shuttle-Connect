import { supabase } from "../config/supabase";
import { throwDatabaseError } from "./repositoryUtils";

interface ListRoutesFilters {
  companyId?: string;
  search?: string;
  active?: boolean;
  from: number;
  to: number;
}

export class RouteRepository {
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("routes")
      .insert(payload)
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }

  async findAll(filters: ListRoutesFilters) {
    let query = supabase
      .from("routes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters.companyId) {
      query = query.eq("company_id", filters.companyId);
    }

    if (filters.active !== undefined) {
      query = query.eq("is_active", filters.active);
    }

    if (filters.search) {
      query = query.or(
        `origin.ilike.%${filters.search}%,destination.ilike.%${filters.search}%`
      );
    }

    const { data, error, count } = await query.range(filters.from, filters.to);

    throwDatabaseError(error);
    return { data: data ?? [], count };
  }

  async findById(id: string, companyId?: string) {
    let query = supabase.from("routes").select("*").eq("id", id);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query.maybeSingle();

    throwDatabaseError(error);
    return data;
  }

  async update(id: string, companyId: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("routes")
      .update(payload)
      .eq("id", id)
      .eq("company_id", companyId)
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }

  async softDelete(id: string, companyId: string) {
    return this.update(id, companyId, { is_active: false });
  }
}

export const routeRepository = new RouteRepository();
