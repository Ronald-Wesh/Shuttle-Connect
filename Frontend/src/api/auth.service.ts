/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIClient } from "./client";
import { AuthPayload, ApiResponse, User } from "../types";

export class AuthService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  /**
   * Get current user/profile
   * GET /api/auth/me
   * Accessible by: all roles
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.client.get<ApiResponse<User>>("/auth/me");
  }

  /**
   * Sign in with email and password
   * POST /api/auth/sign-in
   */
  async signIn(email: string, password: string): Promise<ApiResponse<AuthPayload>> {
    return this.client.post<ApiResponse<AuthPayload>>("/auth/sign-in", {
      email,
      password,
    });
  }

  /**
   * Create a new account with email and password
   * POST /api/auth/sign-up
   */
  async signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<ApiResponse<AuthPayload>> {
    return this.client.post<ApiResponse<AuthPayload>>("/auth/sign-up", {
      email,
      password,
      fullName,
    });
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    localStorage.removeItem("auth_token");
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
