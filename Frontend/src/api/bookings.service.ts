/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIClient } from "./client";
import { Booking, ApiResponse, PaginatedResponse } from "../types";

export interface BookingsQuery {
  page?: number;
  limit?: number;
  status?: string;
  companyId?: string;
  tripId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class BookingsService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Company bookings or own bookings
   * GET /api/bookings
   * Accessible by: staff, driver, customer
   */
  async listBookings(
    query?: BookingsQuery
  ): Promise<PaginatedResponse<Booking>> {
    return this.client.get<PaginatedResponse<Booking>>("/bookings", { params: query });
  }

  /**
   * Create booking
   * POST /api/bookings
   * Accessible by: staff, customer
   */
  async createBooking(data: Partial<Booking>): Promise<ApiResponse<Booking>> {
    return this.client.post<ApiResponse<Booking>>("/bookings", data);
  }

  /**
   * Get booking by ID
   */
  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    return this.client.get<ApiResponse<Booking>>(`/bookings/${id}`);
  }

  /**
   * Confirm booking
   * PATCH /api/bookings/:id/confirm
   * Accessible by: owner, manager, agent, super_admin
   */
  async confirmBooking(id: string): Promise<ApiResponse<Booking>> {
    return this.client.patch<ApiResponse<Booking>>(`/bookings/${id}/confirm`, {});
  }

  /**
   * Cancel company or own booking
   * PATCH /api/bookings/:id/cancel
   * Accessible by: staff, customer
   */
  async cancelBooking(id: string, reason?: string): Promise<ApiResponse<Booking>> {
    return this.client.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
  }
}
