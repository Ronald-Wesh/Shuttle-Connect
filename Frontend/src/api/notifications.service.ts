/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIClient } from "./client";
import { Notification, ApiResponse, PaginatedResponse } from "../types";

export interface NotificationsQuery {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
  companyId?: string;
}

export class NotificationsService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Company notifications
   * GET /api/notifications
   * Accessible by: owner, manager, agent, super_admin
   */
  async listNotifications(
    query?: NotificationsQuery
  ): Promise<PaginatedResponse<Notification>> {
    return this.client.get<PaginatedResponse<Notification>>("/notifications", { params: query });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return this.client.patch<ApiResponse<Notification>>(`/notifications/${id}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return this.client.patch<ApiResponse<void>>(`/notifications/mark-all-read`, {});
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<ApiResponse<void>>(`/notifications/${id}`);
  }
}
