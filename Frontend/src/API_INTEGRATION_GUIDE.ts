/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * API Integration Guide
 * 
 * This guide shows how to use the API services in your React components.
 * 
 * SETUP:
 * 1. Wrap your app with ApiProvider in main.tsx
 * 2. Use the api object or hooks throughout your app
 * 
 * BASIC USAGE:
 * 
 * Using the `api` object directly:
 * ```typescript
 * import { api } from '@/api';
 * 
 * // Get current user
 * const user = await api.auth.getCurrentUser();
 * 
 * // Search trips
 * const trips = await api.trips.searchTrips({ status: 'scheduled' });
 * 
 * // Create booking
 * const booking = await api.bookings.createBooking({
 *   tripId: 'trip-123',
 *   passengerId: 'passenger-456',
 *   seats: [1, 2],
 *   totalAmount: 5000,
 *   paymentMethod: 'card',
 * });
 * ```
 * 
 * Using React hooks:
 * ```typescript
 * import { useTrips, useBookings, useCreateBooking } from '@/hooks/useApi';
 * 
 * export function MyComponent() {
 *   // Fetch trips
 *   const { trips, loading, error, fetch } = useTrips();
 *   
 *   // Fetch bookings
 *   const { bookings } = useBookings({ status: 'confirmed' });
 *   
 *   // Create booking
 *   const { create, loading: creating } = useCreateBooking();
 *   
 *   useEffect(() => {
 *     fetch();
 *   }, []);
 *   
 *   const handleBooking = async () => {
 *     try {
 *       await create({
 *         tripId: 'trip-123',
 *         passengerId: 'passenger-456',
 *         seats: [1, 2],
 *         totalAmount: 5000,
 *         paymentMethod: 'card',
 *       });
 *     } catch (err) {
 *       console.error('Failed to create booking', err);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *       {trips.map(trip => (
 *         <div key={trip.id}>{trip.id}</div>
 *       ))}
 *       <button onClick={handleBooking} disabled={creating}>
 *         {creating ? 'Creating...' : 'Create Booking'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * Using the ApiContext:
 * ```typescript
 * import { useApi } from '@/context/ApiContext';
 * 
 * export function Profile() {
 *   const { user, isAuthenticated, isLoading, setToken, logout } = useApi();
 *   
 *   if (isLoading) return <p>Loading...</p>;
 *   if (!isAuthenticated) return <p>Not authenticated</p>;
 *   
 *   return (
 *     <div>
 *       <h1>{user?.name}</h1>
 *       <p>{user?.email}</p>
 *       <p>Role: {user?.role}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * API SERVICES:
 * 
 * 1. Auth Service (api.auth)
 *    - getCurrentUser(): Get current user profile
 *    - setToken(token): Set authentication token
 *    - getToken(): Get stored token
 *    - isAuthenticated(): Check if authenticated
 * 
 * 2. Companies Service (api.companies)
 *    - createCompany(data): Create a new company
 *    - getCompany(id): Get company details
 *    - updateCompany(id, data): Update company
 * 
 * 3. Routes Service (api.routes)
 *    - listRoutes(query): List all routes
 *    - createRoute(data): Create new route
 *    - updateRoute(id, data): Update route
 *    - deleteRoute(id): Soft-delete route
 * 
 * 4. Trips Service (api.trips)
 *    - searchTrips(query): Search trips
 *    - createTrip(data): Create new trip
 *    - updateTrip(id, data): Update trip
 *    - cancelTrip(id, reason): Cancel trip
 * 
 * 5. Passengers Service (api.passengers)
 *    - listPassengers(query): List passengers
 *    - createPassenger(data): Create new passenger
 *    - getPassenger(id): Get passenger details
 *    - updatePassenger(id, data): Update passenger
 * 
 * 6. Bookings Service (api.bookings)
 *    - listBookings(query): List bookings
 *    - createBooking(data): Create booking
 *    - getBooking(id): Get booking details
 *    - confirmBooking(id): Confirm booking
 *    - cancelBooking(id, reason): Cancel booking
 * 
 * 7. Notifications Service (api.notifications)
 *    - listNotifications(query): List notifications
 *    - markAsRead(id): Mark notification as read
 *    - markAllAsRead(): Mark all as read
 *    - deleteNotification(id): Delete notification
 * 
 * 8. Audit Logs Service (api.auditLogs)
 *    - listAuditLogs(query): List audit logs
 *    - getAuditLog(id): Get audit log details
 * 
 * ENVIRONMENT VARIABLES:
 * 
 * Set VITE_API_URL to configure the API base URL:
 * VITE_API_URL=http://localhost:3001/api
 * 
 * Default is: http://localhost:3001/api
 * 
 * ERROR HANDLING:
 * 
 * The APIClient automatically handles 401 errors by clearing the token
 * and redirecting to login. Other errors are thrown for your app to handle.
 * 
 * All service methods return responses with this structure:
 * {
 *   success: boolean;
 *   data?: T;
 *   error?: string;
 *   message?: string;
 * }
 * 
 * Paginated endpoints return:
 * {
 *   success: boolean;
 *   data: T[];
 *   pagination: {
 *     page: number;
 *     limit: number;
 *     total: number;
 *     pages: number;
 *   };
 *   error?: string;
 * }
 */

export const API_INTEGRATION_GUIDE = "See comments in this file";
