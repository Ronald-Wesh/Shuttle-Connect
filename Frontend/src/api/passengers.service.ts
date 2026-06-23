/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIClient } from "./client";
import { Passenger, ApiResponse, PaginatedResponse } from "../types";

export interface PassengersQuery {
  page?: number;
  limit?: number;
  search?: string;
  companyId?: string;
}

export class PassengersService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * List passengers
   * GET /api/passengers
   * Accessible by: owner, manager, agent, super_admin
   */
  async listPassengers(
    query?: PassengersQuery
  ): Promise<PaginatedResponse<Passenger>> {
    return this.client.get<PaginatedResponse<Passenger>>("/passengers", { params: query });
  }

  /**
   * Create passenger
   * POST /api/passengers
   * Accessible by: owner, manager, agent, super_admin
   */
  async createPassenger(
    data: Partial<Passenger>
  ): Promise<ApiResponse<Passenger>> {
    return this.client.post<ApiResponse<Passenger>>("/passengers", data);
  }

  /**
   * Get passenger by ID
   */
  async getPassenger(id: string): Promise<ApiResponse<Passenger>> {
    return this.client.get<ApiResponse<Passenger>>(`/passengers/${id}`);
  }

  /**
   * Update passenger
   */
  async updatePassenger(
    id: string,
    data: Partial<Passenger>
  ): Promise<ApiResponse<Passenger>> {
    return this.client.patch<ApiResponse<Passenger>>(`/passengers/${id}`, data);
  }
}
