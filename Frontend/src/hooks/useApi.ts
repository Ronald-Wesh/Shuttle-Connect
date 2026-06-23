/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from "react";
import { api } from "../api";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Generic hook for making async API calls with loading/error states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, [asyncFunction]);

  return { ...state, execute };
}

/**
 * Hook for getting current user profile
 */
export function useCurrentUser() {
  const { data, loading, error, execute } = useAsync(
    () => api.auth.getCurrentUser(),
    true
  );
  return { user: data?.data || null, loading, error, refetch: execute };
}

/**
 * Hook for listing routes
 */
export function useRoutes(query?: Parameters<typeof api.routes.listRoutes>[0]) {
  const { data, loading, error, execute } = useAsync(
    () => api.routes.listRoutes(query),
    false
  );
  return { routes: data?.data || [], loading, error, fetch: execute };
}

/**
 * Hook for listing trips
 */
export function useTrips(query?: Parameters<typeof api.trips.searchTrips>[0]) {
  const { data, loading, error, execute } = useAsync(
    () => api.trips.searchTrips(query),
    false
  );
  return { trips: data?.data || [], loading, error, fetch: execute };
}

/**
 * Hook for listing bookings
 */
export function useBookings(query?: Parameters<typeof api.bookings.listBookings>[0]) {
  const { data, loading, error, execute } = useAsync(
    () => api.bookings.listBookings(query),
    false
  );
  return { bookings: data?.data || [], loading, error, fetch: execute };
}

/**
 * Hook for listing passengers
 */
export function usePassengers(query?: Parameters<typeof api.passengers.listPassengers>[0]) {
  const { data, loading, error, execute } = useAsync(
    () => api.passengers.listPassengers(query),
    false
  );
  return { passengers: data?.data || [], loading, error, fetch: execute };
}

/**
 * Hook for listing notifications
 */
export function useNotifications(query?: Parameters<typeof api.notifications.listNotifications>[0]) {
  const { data, loading, error, execute } = useAsync(
    () => api.notifications.listNotifications(query),
    false
  );
  return { notifications: data?.data || [], loading, error, fetch: execute };
}

/**
 * Hook for listing audit logs
 */
export function useAuditLogs(query?: Parameters<typeof api.auditLogs.listAuditLogs>[0]) {
  const { data, loading, error, execute } = useAsync(
    () => api.auditLogs.listAuditLogs(query),
    false
  );
  return { logs: data?.data || [], loading, error, fetch: execute };
}

/**
 * Hook for creating a booking
 */
export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (bookingData: Parameters<typeof api.bookings.createBooking>[0]) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.bookings.createBooking(bookingData);
        setLoading(false);
        return response.data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  return { create, loading, error };
}

/**
 * Hook for confirming a booking
 */
export function useConfirmBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const confirm = useCallback(async (bookingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.bookings.confirmBooking(bookingId);
      setLoading(false);
      return response.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setLoading(false);
      throw error;
    }
  }, []);

  return { confirm, loading, error };
}

/**
 * Hook for cancelling a booking
 */
export function useCancelBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cancel = useCallback(
    async (bookingId: string, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.bookings.cancelBooking(bookingId, reason);
        setLoading(false);
        return response.data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        setLoading(false);
        throw error;
      }
    },
    []
  );

  return { cancel, loading, error };
}
