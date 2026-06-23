/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { api, apiClient } from "../api";

interface ApiContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  setToken: (token: string) => void;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch current user on mount or when token changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.auth.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError(err as Error);
        // If unauthorized, clear auth state
        if ((err as any)?.response?.status === 401) {
          apiClient.setToken("");
          setUser(null);
        }
        // Don't crash on network errors - just clear user state
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if there's a token
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUser();
    } else {
      // No token, just mark loading as done
      setIsLoading(false);
      setUser(null);
    }
  }, []);

  const setToken = (token: string) => {
    apiClient.setToken(token);
    // Refetch user after setting token
    const fetchUser = async () => {
      try {
        const response = await api.auth.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch user after token set:", err);
        setError(err as Error);
        // Don't crash on errors, just clear user
        setUser(null);
      }
    };
    fetchUser();
  };

  const logout = () => {
    apiClient.setToken("");
    setUser(null);
    setError(null);
  };

  const refetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.auth.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to refetch user:", err);
      setError(err as Error);
      // Don't crash on errors
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: ApiContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    setToken,
    logout,
    refetchUser,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within ApiProvider");
  }
  return context;
}
