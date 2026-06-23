/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIClient } from "./client";
import { Route, ApiResponse, PaginatedResponse } from "../types";

export interface RoutesQuery {
  page?: number;
  limit?: number;
  status?: string;
  companyId?: string;
}

export class RoutesService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * List routes
   * GET /api/routes
   * Accessible by: owner, manager, agent, super_admin
   */
  async listRoutes(query?: RoutesQuery): Promise<PaginatedResponse<Route>> {
    return this.client.get<PaginatedResponse<Route>>("/routes", { params: query });
  }

  /**
   * Create route
   * POST /api/routes
   * Accessible by: owner, manager, super_admin
   */
  async createRoute(data: Partial<Route>): Promise<ApiResponse<Route>> {
    return this.client.post<ApiResponse<Route>>("/routes", data);
  }

  /**
   * Update route
   * PATCH /api/routes/:id
   * Accessible by: owner, manager, super_admin
   */
  async updateRoute(
    id: string,
    data: Partial<Route>
  ): Promise<ApiResponse<Route>> {
    return this.client.patch<ApiResponse<Route>>(`/routes/${id}`, data);
  }

  /**
   * Soft-delete route
   * DELETE /api/routes/:id
   * Accessible by: owner, manager, super_admin
   */
  async deleteRoute(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<ApiResponse<void>>(`/routes/${id}`);
  }
}
