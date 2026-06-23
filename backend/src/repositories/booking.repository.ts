import { supabase } from "../config/supabase";
import { throwDatabaseError } from "./repositoryUtils";

interface ListBookingFilters {
  companyId: string;
  passengerId?: string;
  tripId?: string;
  status?: string;
  from: number;
  to: number;
}

interface ListOwnBookingFilters {
  passengerIds: string[];
  tripId?: string;
  status?: string;
  from: number;
  to: number;
}

export class BookingRepository {
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("bookings")
      .insert(payload)
      .select(
        "*, trip:trips!bookings_trip_company_fkey(*), passenger:passengers!bookings_passenger_company_fkey(*)"
      )
      .single();

    throwDatabaseError(error);
    return data;
  }

  async findByCheckoutRequestId(checkoutRequestId: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "*, trip:trips!bookings_trip_company_fkey(*), passenger:passengers!bookings_passenger_company_fkey(*)"
      )
      .eq("checkout_request_id", checkoutRequestId)
      .maybeSingle();

    throwDatabaseError(error);
    return data;
  }

  async findAll(filters: ListBookingFilters) {
    let query = supabase
      .from("bookings")
      .select(
        "*, trip:trips!bookings_trip_company_fkey(*), passenger:passengers!bookings_passenger_company_fkey(*)",
        { count: "exact" }
      )
      .eq("company_id", filters.companyId)
      .order("created_at", { ascending: false });

    if (filters.passengerId) {
      query = query.eq("passenger_id", filters.passengerId);
    }

    if (filters.tripId) {
      query = query.eq("trip_id", filters.tripId);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error, count } = await query.range(filters.from, filters.to);

    throwDatabaseError(error);
    return { data: data ?? [], count };
  }

  async findAllForPassengers(filters: ListOwnBookingFilters) {
    if (filters.passengerIds.length === 0) {
      return { data: [], count: 0 };
    }

    let query = supabase
      .from("bookings")
      .select(
        "*, trip:trips!bookings_trip_company_fkey(*), passenger:passengers!bookings_passenger_company_fkey(*)",
        { count: "exact" }
      )
      .in("passenger_id", filters.passengerIds)
      .order("created_at", { ascending: false });

    if (filters.tripId) {
      query = query.eq("trip_id", filters.tripId);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error, count } = await query.range(filters.from, filters.to);

    throwDatabaseError(error);
    return { data: data ?? [], count };
  }

  async findById(id: string, companyId?: string) {
    let query = supabase
      .from("bookings")
      .select(
        "*, trip:trips!bookings_trip_company_fkey(*), passenger:passengers!bookings_passenger_company_fkey(*)"
      )
      .eq("id", id);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query.maybeSingle();

    throwDatabaseError(error);
    return data;
  }

  async findByIdForPassengers(id: string, passengerIds: string[]) {
    if (passengerIds.length === 0) {
      return null;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*, trip:trips(*), passenger:passengers(*)")
      .eq("id", id)
      .in("passenger_id", passengerIds)
      .maybeSingle();

    throwDatabaseError(error);
    return data;
  }

  async update(id: string, companyId: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", id)
      .eq("company_id", companyId)
      .select(
        "*, trip:trips!bookings_trip_company_fkey(*), passenger:passengers!bookings_passenger_company_fkey(*)"
      )
      .single();

    throwDatabaseError(error);
    return data;
  }

  async confirm(id: string, actorId: string | null) {
    const { data, error } = await supabase.rpc("confirm_booking", {
      p_booking_id: id,
      p_actor_id: actorId
    });

    throwDatabaseError(error);
    return data;
  }

  async cancel(id: string, actorId: string | null, reason?: string) {
    const { data, error } = await supabase.rpc("cancel_booking", {
      p_booking_id: id,
      p_actor_id: actorId,
      p_reason: reason ?? null
    });

    throwDatabaseError(error);
    return data;
  }
}

export const bookingRepository = new BookingRepository();
