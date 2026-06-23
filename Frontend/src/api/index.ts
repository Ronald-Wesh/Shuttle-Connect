/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, APIClient } from "./client";
import { AuthService } from "./auth.service";
import { CompaniesService } from "./companies.service";
import { RoutesService } from "./routes.service";
import { TripsService } from "./trips.service";
import { PassengersService } from "./passengers.service";
import { BookingsService } from "./bookings.service";
import { NotificationsService } from "./notifications.service";
import { AuditLogsService } from "./audit-logs.service";

/**
 * Centralized API service that combines all service modules
 * Provides easy access to all API endpoints
 */
export class API {
  public auth: AuthService;
  public companies: CompaniesService;
  public routes: RoutesService;
  public trips: TripsService;
  public passengers: PassengersService;
  public bookings: BookingsService;
  public notifications: NotificationsService;
  public auditLogs: AuditLogsService;

  constructor(client: APIClient) {
    this.auth = new AuthService(client);
    this.companies = new CompaniesService(client);
    this.routes = new RoutesService(client);
    this.trips = new TripsService(client);
    this.passengers = new PassengersService(client);
    this.bookings = new BookingsService(client);
    this.notifications = new NotificationsService(client);
    this.auditLogs = new AuditLogsService(client);
  }
}

// Initialize the API with the default client
export const api = new API(apiClient);

// Export everything for convenience
export * from "./auth.service";
export * from "./companies.service";
export * from "./routes.service";
export * from "./trips.service";
export * from "./passengers.service";
export * from "./bookings.service";
export * from "./notifications.service";
export * from "./audit-logs.service";
export { apiClient };
