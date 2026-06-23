/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIClient } from "./client";
import { Trip, ApiResponse, PaginatedResponse } from "../types";

export interface TripsQuery {
  page?: number;
  limit?: number;
  status?: string;
  routeId?: string;
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class TripsService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Search trips
   * GET /api/trips
   * Accessible by: all roles
   */
  async searchTrips(query?: TripsQuery): Promise<PaginatedResponse<Trip>> {
    return this.client.get<PaginatedResponse<Trip>>("/trips", { params: query });
  }

  /**
   * Create trip
   * POST /api/trips
   * Accessible by: owner, manager, super_admin
   */
  async createTrip(data: Partial<Trip>): Promise<ApiResponse<Trip>> {
    return this.client.post<ApiResponse<Trip>>("/trips", data);
  }

  /**
   * Update trip
   * PATCH /api/trips/:id
   * Accessible by: owner, manager, super_admin
   */
  async updateTrip(
    id: string,
    data: Partial<Trip>
  ): Promise<ApiResponse<Trip>> {
    return this.client.patch<ApiResponse<Trip>>(`/trips/${id}`, data);
  }

  /**
   * Cancel trip
   * PATCH /api/trips/:id/cancel
   * Accessible by: owner, manager, super_admin
   */
  async cancelTrip(id: string, reason?: string): Promise<ApiResponse<Trip>> {
    return this.client.patch<ApiResponse<Trip>>(`/trips/${id}/cancel`, { reason });
  }
}
