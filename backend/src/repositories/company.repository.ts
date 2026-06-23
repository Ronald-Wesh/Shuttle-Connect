import { supabase } from "../config/supabase";
import { throwDatabaseError } from "./repositoryUtils";

export class CompanyRepository {
  async create(payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("companies")
      .insert(payload)
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }

  async findById(id: string) {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    throwDatabaseError(error);
    return data;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("companies")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }
}

export const companyRepository = new CompanyRepository();
