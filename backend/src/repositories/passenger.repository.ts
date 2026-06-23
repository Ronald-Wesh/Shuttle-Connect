import { supabase } from "../config/supabase";
import { throwDatabaseError } from "./repositoryUtils";

interface ListPassengerFilters {
  companyId: string;
  search?: string;
  from: number;
  to: number;
}

export class PassengerRepository {
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("passengers")
      .insert(payload)
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }

  async findAll(filters: ListPassengerFilters) {
    let query = supabase
      .from("passengers")
      .select("*", { count: "exact" })
      .eq("company_id", filters.companyId)
      .order("created_at", { ascending: false });

    if (filters.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    const { data, error, count } = await query.range(filters.from, filters.to);

    throwDatabaseError(error);
    return { data: data ?? [], count };
  }

  async findById(id: string, companyId?: string) {
    let query = supabase
      .from("passengers")
      .select("*")
      .eq("id", id);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query.maybeSingle();

    throwDatabaseError(error);
    return data;
  }

  async findIdsByUser(userId: string) {
    const { data, error } = await supabase
      .from("passengers")
      .select("id")
      .eq("user_id", userId);

    throwDatabaseError(error);
    return (data ?? []).map((passenger) => passenger.id as string);
  }

  async update(id: string, companyId: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("passengers")
      .update(payload)
      .eq("id", id)
      .eq("company_id", companyId)
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }
}

export const passengerRepository = new PassengerRepository();
