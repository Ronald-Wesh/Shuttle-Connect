# ShuttleConnect Sacco Platform Guide

This guide explains the backend architecture, the role model, Sacco data isolation, route/trip/car setup, and the API contract needed by the frontend team.

In this backend, a Sacco is represented by a `company`. Every operational record that belongs to a Sacco has a `company_id` column and is protected in both the API service layer and Supabase RLS.

## What The Platform Supports

The backend currently supports:

- Supabase OTP authentication.
- Multi-Sacco SaaS isolation.
- Role-based access control.
- Sacco/company onboarding.
- Route management per Sacco.
- Vehicle/car management per Sacco.
- Trip creation using a Sacco route and Sacco vehicle.
- Passenger management.
- Booking creation, confirmation, cancellation, and seat restoration.
- Audit logs for important actions.
- Notification records for future SMS, email, push, and WhatsApp integrations.
- OpenAPI contract at `/api/docs`.

M-Pesa and USSD are intentionally left as future integrations, but the booking and notification services are structured so those integrations can attach cleanly later.

## Core Data Model

### Sacco

Database table: `companies`

A Sacco owns operational data:

- routes
- vehicles
- trips
- passengers
- bookings
- audit logs
- notifications

Important fields:

- `id`
- `name`
- `registration_number`
- `phone`
- `email`
- `owner_id`
- `is_active`

### User Profile

Database table: `profiles`

Supabase Auth owns login. The backend owns operational profile data:

- `id`: same UUID as `auth.users.id`
- `role`
- `company_id`
- `email`
- `phone`
- `full_name`

When a Supabase Auth user is created, `schema.sql` creates a matching profile automatically through `handle_new_user()`.

### Route

Database table: `routes`

A route belongs to exactly one Sacco.

Important fields:

- `company_id`
- `origin`
- `destination`
- `distance_km`
- `estimated_duration_minutes`
- `is_active`

Routes are scoped by Sacco. A Sacco owner, manager, or agent from Sacco A cannot read or modify routes from Sacco B.

### Vehicle Or Car

Database table: `vehicles`

A vehicle belongs to exactly one Sacco and is used when creating trips.

Important fields:

- `company_id`
- `name`
- `plate_number`
- `model`
- `seat_capacity`
- `status`: `active`, `maintenance`, or `inactive`

Only active vehicles can be assigned to new trips.

### Trip

Database table: `trips`

A trip is an actual scheduled journey. It must belong to one Sacco, use one Sacco route, and use one Sacco vehicle.

Important fields:

- `company_id`
- `route_id`
- `vehicle_id`
- `departure_time`
- `arrival_time`
- `fare_amount`
- `total_seats`
- `available_seats`
- `status`

The backend checks that:

- the route belongs to the same Sacco as the trip
- the vehicle belongs to the same Sacco as the trip
- the vehicle is active
- trip seats do not exceed the vehicle seat capacity
- total seats cannot be lowered below already reserved seats

The database also has composite foreign keys to prevent cross-Sacco route, vehicle, trip, passenger, and booking mismatches.

### Passenger

Database table: `passengers`

A passenger belongs to one Sacco. A passenger can optionally be linked to a Supabase user through `user_id`.

Important fields:

- `company_id`
- `user_id`
- `full_name`
- `phone`
- `email`
- `national_id`

### Booking

Database table: `bookings`

A booking belongs to one Sacco and references a trip and passenger from the same Sacco.

Important fields:

- `company_id`
- `trip_id`
- `passenger_id`
- `booking_reference`
- `seat_count`
- `total_amount`
- `status`: `pending`, `confirmed`, `cancelled`, `expired`
- `payment_status`: `pending`, `paid`, `failed`, `refunded`

Booking confirmation and cancellation use database RPC functions:

- `confirm_booking()`: atomically confirms a booking and reduces available seats.
- `cancel_booking()`: cancels a booking and restores seats if it was already confirmed.

These RPC functions are only granted to `service_role`, so users cannot bypass backend permissions.

## Role-Based Access Control

Permissions are defined in:

```text
src/constants/permissions.ts
```

The middleware is defined in:

```text
src/middleware/auth.middleware.ts
```

### Roles

| Role | Purpose |
| --- | --- |
| `super_admin` | Platform operator. Can access all permissions. Must pass `companyId` for tenant-scoped sensitive operations. |
| `company_owner` | Owns one Sacco and can manage company details, routes, vehicles, trips, passengers, bookings, notifications, and audit logs. |
| `manager` | Manages operational resources inside one Sacco. |
| `agent` | Handles passengers and bookings inside one Sacco. |
| `driver` | Reads Sacco trip and booking data needed for operations. |
| `customer` | Searches trips, creates own bookings, views own bookings, cancels own bookings, and can create a Sacco during onboarding. |

### Permission Summary

| Area | Owner | Manager | Agent | Driver | Customer |
| --- | --- | --- | --- | --- | --- |
| Company read | yes | yes | no | no | no |
| Company update | yes | no | no | no | no |
| Routes | full | full | read | no | no |
| Vehicles/cars | full | full | read | read | no |
| Trips | full | full | read | read | read |
| Passengers | full | full | create/read/update | no | no |
| Company bookings | full | full | create/read/confirm/cancel | read | no |
| Own bookings | no | no | no | no | create/read/cancel |
| Notifications | read | read | read | no | no |
| Audit logs | read | read | no | no | no |

## Sacco Data Isolation

The backend protects Sacco data in two layers.

### 1. API Service Layer

Every Sacco-scoped service uses helper functions from:

```text
src/middleware/company.middleware.ts
```

Key helpers:

- `resolveCompanyId(user, requestedCompanyId)`
- `assertCompanyAccess(user, companyId)`
- `canAccessCompany(user, companyId)`

These helpers ensure a staff user only touches their own Sacco's records.

Example:

```text
Sacco A manager -> companyId = A
Request tries to update Sacco B route
Backend rejects with 403
```

### 2. Supabase RLS

Supabase RLS policies live in:

```text
src/database/rls.sql
```

RLS protects direct database access by checking:

- current user role
- current user company
- whether the target row's `company_id` matches

Even though the backend uses the service role key, RLS remains important for future direct Supabase reads from clients and for defense in depth.

## Route, Vehicle, Trip Flow

Use this order when a Sacco is setting up operations:

1. Create company/Sacco.
2. Create route.
3. Create vehicle/car.
4. Create trip using `routeId` and `vehicleId`.
5. Create passenger.
6. Create booking.
7. Confirm booking after payment or agent approval.

### Create Route

```http
POST /api/routes
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "origin": "Nairobi",
  "destination": "Mombasa",
  "distanceKm": 482,
  "estimatedDurationMinutes": 510
}
```

### Create Vehicle/Car

```http
POST /api/vehicles
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Executive Shuttle",
  "plateNumber": "KDA 001S",
  "model": "Toyota Hiace",
  "seatCapacity": 14,
  "status": "active"
}
```

### Create Trip

```http
POST /api/trips
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "routeId": "22222222-2222-2222-2222-222222222222",
  "vehicleId": "55555555-5555-5555-5555-555555555555",
  "departureTime": "2026-06-01T06:00:00.000Z",
  "arrivalTime": "2026-06-01T14:00:00.000Z",
  "fareAmount": 1800
}
```

If `totalSeats` is omitted, the backend uses the selected vehicle's `seatCapacity`.

Optional:

```json
{
  "routeId": "22222222-2222-2222-2222-222222222222",
  "vehicleId": "55555555-5555-5555-5555-555555555555",
  "departureTime": "2026-06-01T06:00:00.000Z",
  "fareAmount": 1800,
  "totalSeats": 12
}
```

`totalSeats` cannot exceed the vehicle's `seatCapacity`.

## Main API Endpoints

All protected endpoints require:

```http
Authorization: Bearer <supabase_access_token>
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/api` | API metadata |
| `GET` | `/api/docs` | OpenAPI contract |
| `GET` | `/api/auth/me` | Current user |
| `POST` | `/api/companies` | Create Sacco |
| `GET` | `/api/companies/:id` | Get Sacco |
| `PATCH` | `/api/companies/:id` | Update Sacco |
| `GET` | `/api/routes` | List routes |
| `POST` | `/api/routes` | Create route |
| `GET` | `/api/routes/:id` | Get route |
| `PATCH` | `/api/routes/:id` | Update route |
| `DELETE` | `/api/routes/:id` | Deactivate route |
| `GET` | `/api/vehicles` | List cars/vehicles |
| `POST` | `/api/vehicles` | Create car/vehicle |
| `GET` | `/api/vehicles/:id` | Get car/vehicle |
| `PATCH` | `/api/vehicles/:id` | Update car/vehicle |
| `DELETE` | `/api/vehicles/:id` | Deactivate car/vehicle |
| `GET` | `/api/trips` | Search/list trips |
| `POST` | `/api/trips` | Create trip |
| `GET` | `/api/trips/:id` | Get trip |
| `PATCH` | `/api/trips/:id` | Update trip |
| `PATCH` | `/api/trips/:id/cancel` | Cancel trip |
| `GET` | `/api/passengers` | List passengers |
| `POST` | `/api/passengers` | Create passenger |
| `GET` | `/api/bookings` | List bookings |
| `POST` | `/api/bookings` | Create booking |
| `GET` | `/api/bookings/:id` | Get booking |
| `PATCH` | `/api/bookings/:id/confirm` | Confirm booking |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel booking |
| `GET` | `/api/notifications` | List notifications |
| `GET` | `/api/audit-logs` | List audit logs |

## Frontend Connection

The frontend should authenticate with Supabase OTP first, then call this backend.

```ts
const apiBaseUrl = "http://localhost:5000";

async function apiGet(path: string, accessToken: string) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  return response.json();
}

const me = await apiGet("/api/auth/me", session.access_token);
```

Success response format:

```json
{
  "success": true,
  "message": "Trips loaded",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Error response format:

```json
{
  "success": false,
  "message": "You cannot access another company's data",
  "details": null
}
```

Response data is returned in camelCase for frontend convenience.

## Supabase Setup

Run SQL in this order:

1. `src/database/schema.sql`
2. `src/database/rls.sql`
3. `src/database/seed.sql` optional demo data

Important:

- Use `SUPABASE_ANON_KEY` for token verification.
- Use `SUPABASE_SERVICE_ROLE_KEY` only on the backend.
- Never expose the service role key to the frontend.

## Local Backend Setup

Create `.env` from `.env.example`:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ALLOWED_ORIGINS=*

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

Install and run:

```powershell
cd backend
npm install
npm run dev
```

Verify:

```powershell
npm run build
```

## Definition Checklist

The backend is considered correctly defined when:

- every Sacco-owned table has `company_id`
- all Sacco operations call `resolveCompanyId` or `assertCompanyAccess`
- routes belong to one Sacco
- vehicles belong to one Sacco
- trips reference a route and vehicle from the same Sacco
- bookings reference a trip and passenger from the same Sacco
- customer users can only read/cancel their own bookings
- staff users cannot access another Sacco's data
- seat reduction and restoration happen through booking RPCs
- `/api/docs` lists request fields for frontend integration
- `npm run build` passes

## Current Verification

The backend was checked with:

```powershell
npm.cmd run build
```

The TypeScript build passes.
