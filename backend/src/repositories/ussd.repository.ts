import { supabase } from "../config/supabase";
import { UssdSession } from "../interfaces/ussd.interface";

export class UssdRepository {
  async getSession(sessionId: string): Promise<UssdSession | null> {
    const { data, error } = await supabase
      .from("ussd_sessions")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) return null;

    return {
      sessionId: data.session_id,
      phoneNumber: data.phone_number,
      state: data.state,
      data: data.data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async createSession(session: Omit<UssdSession, "createdAt" | "updatedAt">): Promise<UssdSession> {
    const { data, error } = await supabase
      .from("ussd_sessions")
      .insert([
        {
          session_id: session.sessionId,
          phone_number: session.phoneNumber,
          state: session.state,
          data: session.data
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      sessionId: data.session_id,
      phoneNumber: data.phone_number,
      state: data.state,
      data: data.data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async updateSession(sessionId: string, state: string, sessionData: Record<string, any>): Promise<UssdSession> {
    const { data, error } = await supabase
      .from("ussd_sessions")
      .update({
        state,
        data: sessionData,
        updated_at: new Date().toISOString()
      })
      .eq("session_id", sessionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      sessionId: data.session_id,
      phoneNumber: data.phone_number,
      state: data.state,
      data: data.data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("ussd_sessions")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      throw error;
    }
  }
}
