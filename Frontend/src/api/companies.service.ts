/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIClient } from "./client";
import { Company, ApiResponse } from "../types";

export class CompaniesService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Create company/onboard owner
   * POST /api/companies
   * Accessible by: customer, super_admin
   */
  async createCompany(data: Partial<Company>): Promise<ApiResponse<Company>> {
    return this.client.post<ApiResponse<Company>>("/companies", data);
  }

  /**
   * Read company
   * GET /api/companies/:id
   * Accessible by: owner, manager, super_admin
   */
  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return this.client.get<ApiResponse<Company>>(`/companies/${id}`);
  }

  /**
   * Update company
   * PATCH /api/companies/:id
   * Accessible by: owner, super_admin
   */
  async updateCompany(
    id: string,
    data: Partial<Company>
  ): Promise<ApiResponse<Company>> {
    return this.client.patch<ApiResponse<Company>>(`/companies/${id}`, data);
  }
}
