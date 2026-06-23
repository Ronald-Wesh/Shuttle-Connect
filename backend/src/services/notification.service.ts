import { supabase } from "../config/supabase";
import type { AuthenticatedUser } from "../interfaces/auth.interface";
import { resolveCompanyId } from "../middleware/company.middleware";
import { getPagination, getPaginationMeta } from "../utils/pagination";
import { throwDatabaseError } from "../repositories/repositoryUtils";

interface CreateNotificationPayload {
  companyId: string;
  recipientUserId?: string;
  recipientPhone?: string;
  title: string;
  message: string;
  channel?: "in_app" | "sms" | "email" | "whatsapp";
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  async create(payload: CreateNotificationPayload) {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        company_id: payload.companyId,
        recipient_user_id: payload.recipientUserId ?? null,
        recipient_phone: payload.recipientPhone ?? null,
        title: payload.title,
        message: payload.message,
        channel: payload.channel ?? "in_app",
        metadata: payload.metadata ?? {}
      })
      .select("*")
      .single();

    throwDatabaseError(error);
    return data;
  }

  async list(
    user: AuthenticatedUser,
    query: Record<string, unknown> & {
      companyId?: string;
      unreadOnly?: boolean;
    }
  ) {
    const companyId = resolveCompanyId(user, query.companyId);
    const { page, limit, from, to } = getPagination(query);

    let request = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (query.unreadOnly) {
      request = request.is("read_at", null);
    }

    const { data, error, count } = await request.range(from, to);

    throwDatabaseError(error);
    return {
      notifications: data ?? [],
      meta: getPaginationMeta(page, limit, count)
    };
  }
}

export const notificationService = new NotificationService();
