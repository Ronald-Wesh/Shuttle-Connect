# ShuttleConnect Backend

Production-oriented Express + TypeScript backend for a multi-company passenger shuttle booking SaaS. Supabase handles OTP authentication and Postgres storage; this API owns authorization, tenant isolation, validation, booking workflows, audit logging, and integration points for future USSD/M-Pesa work.

For the full Sacco platform explanation, role matrix, data isolation rules, and route/vehicle/trip setup flow, see `SACCO_PLATFORM_GUIDE.md`.

## System Outline

The backend is organized by responsibility:

- `src/config`: environment and Supabase clients
- `src/constants`: roles, permissions, booking/trip status constants
- `src/middleware`: authentication, permission checks, tenant isolation, validation, errors
- `src/controllers`: HTTP request/response handlers
- `src/services`: business rules and audit/notification orchestration
- `src/repositories`: Supabase table/RPC access
- `src/validators`: Zod request schemas
- `src/database`: Supabase schema, RLS, seed SQL
- `src/docs/openapi.ts`: machine-readable API contract served at `/api/docs`

## Authentication Flow

Supabase OTP stays outside this backend:

1. Frontend signs the user in with Supabase OTP.
2. Frontend receives a Supabase access token.
3. Frontend calls this backend with:

```http
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

The backend verifies the token with Supabase, loads `profiles`, attaches `req.user`, then applies permission and tenant checks.

## Roles And Permissions

Permissions are centralized in `src/constants/permissions.ts`.

| Role | Access |
| --- | --- |
| `super_admin` | All permissions. Must pass `companyId` for tenant list APIs that expose PII, such as bookings, passengers, audit logs, and notifications. |
| `company_owner` | Manage company, routes, trips, passengers, bookings, notifications, and audit logs inside their company only. |
| `manager` | Manage operational resources inside their company, except company profile ownership changes. |
| `agent` | Handle passengers and bookings inside their company. |
| `driver` | Read assigned company trip/booking data. |
| `customer` | Search trips, create own bookings, view own bookings, cancel own bookings, and create a company during onboarding. |

## Data Isolation Rules

Tenant data is isolated in two layers:

1. Backend service checks use `resolveCompanyId` and `assertCompanyAccess`.
2. Supabase RLS policies in `src/database/rls.sql` protect direct database access.

The backend uses the Supabase service role key, so every company-scoped repository call must be scoped in the service layer. This is why company access checks live before reads/writes in services, not only in SQL.

Booking seat changes are protected by RPC functions:

- `confirm_booking`: confirms only pending bookings and atomically reduces seats.
- `cancel_booking`: cancels bookings and restores seats when needed.

Those RPC functions are revoked from `anon` and `authenticated` roles and granted only to `service_role`, so users cannot bypass backend authorization.

## Environment

Create `backend/.env` from `.env.example`:

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

Do not commit `.env`.

## Supabase Setup

Run SQL in this order in the Supabase SQL editor:

1. `src/database/schema.sql`
2. `src/database/rls.sql`
3. `src/database/seed.sql` optional demo data

Then enable the OTP providers you need in Supabase Auth.

## Running Locally

```powershell
cd backend
npm install
npm run dev
```

Health check:

```http
GET http://localhost:5000/health
```

API metadata:

```http
GET http://localhost:5000/api
```

OpenAPI contract:

```http
GET http://localhost:5000/api/docs
```

## Frontend Connection Example

```ts
const apiBaseUrl = "http://localhost:5000";

const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
  headers: {
    Authorization: `Bearer ${supabaseSession.access_token}`,
    "Content-Type": "application/json"
  }
});

const body = await response.json();
```

All successful responses follow this shape:

```json
{
  "success": true,
  "message": "Bookings loaded",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

All response fields are camelCase, even though Supabase columns are snake_case.

## Core API

| Method | Path | Purpose | Key Roles |
| --- | --- | --- | --- |
| `GET` | `/api/auth/me` | Current user/profile | all roles |
| `POST` | `/api/companies` | Create company/onboard owner | customer, super_admin |
| `GET` | `/api/companies/:id` | Read company | owner, manager, super_admin |
| `PATCH` | `/api/companies/:id` | Update company | owner, super_admin |
| `GET` | `/api/routes` | List routes | owner, manager, agent, super_admin |
| `POST` | `/api/routes` | Create route | owner, manager, super_admin |
| `PATCH` | `/api/routes/:id` | Update route | owner, manager, super_admin |
| `DELETE` | `/api/routes/:id` | Soft-delete route | owner, manager, super_admin |
| `GET` | `/api/trips` | Search trips | all roles |
| `POST` | `/api/trips` | Create trip | owner, manager, super_admin |
| `PATCH` | `/api/trips/:id` | Update trip | owner, manager, super_admin |
| `PATCH` | `/api/trips/:id/cancel` | Cancel trip | owner, manager, super_admin |
| `GET` | `/api/passengers` | List passengers | owner, manager, agent, super_admin |
| `POST` | `/api/passengers` | Create passenger | owner, manager, agent, super_admin |
| `GET` | `/api/bookings` | Company bookings or own bookings | staff, driver, customer |
| `POST` | `/api/bookings` | Create booking | staff, customer |
| `PATCH` | `/api/bookings/:id/confirm` | Confirm booking | owner, manager, agent, super_admin |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel company or own booking | staff, customer |
| `GET` | `/api/notifications` | Company notifications | owner, manager, agent, super_admin |
| `GET` | `/api/audit-logs` | Company audit trail | owner, manager, super_admin |

## Important Request Fields

Create a booking for an existing passenger:

```json
{
  "tripId": "33333333-3333-3333-3333-333333333333",
  "passengerId": "44444444-4444-4444-4444-444444444444",
  "seatCount": 2
}
```

Create a booking and passenger in one request:

```json
{
  "tripId": "33333333-3333-3333-3333-333333333333",
  "passenger": {
    "fullName": "Jane Doe",
    "phone": "+254711111111",
    "email": "jane@example.com",
    "nationalId": "12345678"
  },
  "seatCount": 1
}
```

Create a route:

```json
{
  "origin": "Nairobi",
  "destination": "Mombasa",
  "distanceKm": 482,
  "estimatedDurationMinutes": 510
}
```

When the caller is `super_admin`, include `companyId` for company-scoped create/list operations:

```json
{
  "companyId": "11111111-1111-1111-1111-111111111111",
  "origin": "Nairobi",
  "destination": "Nakuru"
}
```

## Future Integration Points

- M-Pesa should update `payment_status` and then call booking confirmation after payment success.
- USSD can call the same booking services through a dedicated controller later.
- SMS/WhatsApp/email providers should be added behind `notification.service.ts`.
