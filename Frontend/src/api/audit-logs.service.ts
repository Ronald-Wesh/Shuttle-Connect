/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIClient } from "./client";
import { AuditLog, ApiResponse, PaginatedResponse } from "../types";

export interface AuditLogsQuery {
  page?: number;
  limit?: number;
  action?: string;
  resource?: string;
  userId?: string;
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class AuditLogsService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Company audit trail
   * GET /api/audit-logs
   * Accessible by: owner, manager, super_admin
   */
  async listAuditLogs(
    query?: AuditLogsQuery
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.client.get<PaginatedResponse<AuditLog>>("/audit-logs", { params: query });
  }

  /**
   * Get audit log by ID
   */
  async getAuditLog(id: string): Promise<ApiResponse<AuditLog>> {
    return this.client.get<ApiResponse<AuditLog>>(`/audit-logs/${id}`);
  }
}
