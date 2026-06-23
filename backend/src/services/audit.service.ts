import { supabase } from "../config/supabase";
import type { AuthenticatedUser } from "../interfaces/auth.interface";
import { resolveCompanyId } from "../middleware/company.middleware";
import { throwDatabaseError } from "../repositories/repositoryUtils";
import { logger } from "../utils/logger";
import { getPagination, getPaginationMeta } from "../utils/pagination";

interface AuditPayload {
  companyId?: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  async log(payload: AuditPayload) {
    const { error } = await supabase.from("audit_logs").insert({
      company_id: payload.companyId ?? null,
      actor_id: payload.actorId ?? null,
      action: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId ?? null,
      metadata: payload.metadata ?? {}
    });

    if (error) {
      logger.warn("Failed to write audit log", {
        action: payload.action,
        entityType: payload.entityType,
        error: error.message
      });
    }
  }

  async list(
    user: AuthenticatedUser,
    query: Record<string, unknown> & {
      companyId?: string;
      action?: string;
      entityType?: string;
      actorId?: string;
    }
  ) {
    const companyId = resolveCompanyId(user, query.companyId);
    const { page, limit, from, to } = getPagination(query);

    let request = supabase
      .from("audit_logs")
      .select("*, actor:profiles(id,email,phone,full_name,role)", {
        count: "exact"
      })
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (query.action) {
      request = request.eq("action", query.action);
    }

    if (query.entityType) {
      request = request.eq("entity_type", query.entityType);
    }

    if (query.actorId) {
      request = request.eq("actor_id", query.actorId);
    }

    const { data, error, count } = await request.range(from, to);

    throwDatabaseError(error);
    return {
      auditLogs: data ?? [],
      meta: getPaginationMeta(page, limit, count)
    };
  }
}

export const auditService = new AuditService();
