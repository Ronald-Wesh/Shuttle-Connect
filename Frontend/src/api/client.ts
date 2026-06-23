/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface RequestConfig extends RequestInit {
  params?: object;
}

// Use the backend directly in development and allow an override in production.
// Relative `/api` only works when the frontend and backend are served from the same origin.
const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? "/api" : "http://localhost:5001/api");

export class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private clearToken(): void {
    localStorage.removeItem("auth_token");
  }

  public setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  public getClient(): string {
    return this.baseURL;
  }

  private buildUrl(url: string, params?: object): string {
    const base = this.baseURL.replace(/\/$/, "");
    const origin = base.startsWith("/") ? window.location.origin : "";
    const normalizedBase = base.startsWith("/") ? `${origin}${base}` : base;
    const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;
    const fullUrl = new URL(`${normalizedBase}/${normalizedUrl}`);

    if (params) {
      for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
        if (value !== undefined && value !== null) {
          fullUrl.searchParams.set(key, String(value));
        }
      }
    }

    return fullUrl.toString();
  }

  private async request<T>(method: string, url: string, config?: RequestConfig, data?: unknown): Promise<T> {
    const headers = new Headers(config?.headers);
    headers.set("Content-Type", "application/json");

    const token = this.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(this.buildUrl(url, config?.params), {
      ...config,
      method,
      headers,
      body: data === undefined ? config?.body : JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401 && this.getToken()) {
        this.clearToken();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      const error = new Error(`Request failed with status ${response.status}`);
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("GET", url, config);
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("POST", url, config, data);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("PATCH", url, config, data);
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("PUT", url, config, data);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, config);
  }
}

export const apiClient = new APIClient();
