# ShuttleConnect

A multi-tenant SaaS platform for passenger shuttle (Sacco) booking in Kenya. Transport companies onboard themselves, define routes and vehicles, schedule trips, and accept seat bookings — all through a shared platform with strict per-company data isolation.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [Roles & Permissions](#roles--permissions)
- [Data Isolation](#data-isolation)
- [Future Integrations](#future-integrations)

---

## Overview

ShuttleConnect connects passengers with shuttle operators (Saccos) across Kenya. Key capabilities:

- **Multi-tenant**: Each Sacco's data is fully isolated at the API and database (RLS) layer
- **Booking workflow**: Passengers search trips, reserve seats, and receive booking confirmations
- **Atomic seat management**: Postgres RPC functions prevent double-booking under concurrent load
- **Role-based access**: Six roles from Super Admin down to Customer, each with scoped permissions
- **AI assistant**: Gemini-powered chat widget with live route/trip context
- **USSD & SMS ready**: Africa's Talking integration hooks for feature-phone users
- **M-Pesa ready**: Daraja API integration points for mobile money payments

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, Tailwind CSS 4, Motion |
| Backend | Node.js, Express 5, TypeScript |
| Database & Auth | Supabase (PostgreSQL + OTP Auth) |
| Validation | Zod |
| AI | Google Gemini API |
| SMS / USSD | Africa's Talking |
| Payments | Safaricom Daraja (M-Pesa) |
| Package Manager | pnpm |

---

## Project Structure

```
shuttleconnect/
├── Frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── api/            # Service classes (auth, bookings, trips …)
│   │   ├── components/     # UI components
│   │   ├── context/        # ApiContext — global auth state
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Navigation utilities
│   │   └── pages/          # AdminDashboard, CustomerSite, AuthPages
│   └── vite.config.js
│
├── backend/                # Express + TypeScript API
│   ├── src/
│   │   ├── config/         # Env validation, Supabase clients
│   │   ├── constants/      # Roles, permissions, status enums
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Supabase data access
│   │   ├── middleware/      # Auth, tenant isolation, validation, errors
│   │   ├── validators/     # Zod request schemas
│   │   ├── database/       # schema.sql, rls.sql, seed.sql
│   │   └── docs/           # OpenAPI contract → /api/docs
│   └── .env.example
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
cd Frontend && pnpm install
cd ../backend && pnpm install
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
# Fill in your Supabase and API credentials (see below)
```

### 3. Set up the database

Run the SQL files in order inside the Supabase SQL editor:

```
backend/src/database/schema.sql   ← tables & indexes
backend/src/database/rls.sql      ← row-level security policies
backend/src/database/seed.sql     ← optional demo data
```

Then enable Email/Phone OTP in your Supabase project under **Authentication → Providers**.

### 4. Run both servers

**Backend** (port 8000):
```bash
cd backend && pnpm run dev
```

**Frontend** (port 5000):
```bash
cd Frontend && pnpm run dev
```

The frontend proxies all `/api/*` requests to the backend automatically — no CORS configuration needed locally.

---

## Environment Variables

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port (default `8000`) |
| `NODE_ENV` | No | `development` / `production` |
| `SUPABASE_URL` | **Yes** | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | **Yes** | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key |
| `ALLOWED_ORIGINS` | No | CORS origins, comma-separated (`*` for all) |
| `GEMINI_API_KEY` | No | Google Gemini key for the AI chat widget |
| `AFRICASTALKING_API_KEY` | No | Africa's Talking API key |
| `AFRICASTALKING_USERNAME` | No | AT username (default `sandbox`) |
| `DARAJA_CONSUMER_KEY` | No | Safaricom Daraja consumer key |
| `DARAJA_CONSUMER_SECRET` | No | Safaricom Daraja consumer secret |
| `DARAJA_SHORTCODE` | No | M-Pesa till/paybill number |
| `DARAJA_PASSKEY` | No | Daraja passkey |
| `DARAJA_CALLBACK_URL` | No | Public URL for M-Pesa payment callbacks |
| `DARAJA_ENV` | No | `sandbox` or `production` |

### `Frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base path (default `/api` — proxied through Vite) |

---

## API Reference

Full OpenAPI documentation is served at `/api/docs` when the backend is running.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/sign-in` | Sign in with email + password |
| `POST` | `/api/auth/sign-up` | Create a new account |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Companies

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/companies` | Onboard a new Sacco |
| `GET` | `/api/companies/:id` | Get company details |
| `PATCH` | `/api/companies/:id` | Update company profile |

### Routes, Trips & Bookings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/routes` | List routes |
| `POST` | `/api/routes` | Create route |
| `GET` | `/api/trips` | Search trips |
| `POST` | `/api/trips` | Schedule a trip |
| `PATCH` | `/api/trips/:id/cancel` | Cancel a trip |
| `GET` | `/api/bookings` | List bookings (own or company-wide) |
| `POST` | `/api/bookings` | Create a booking |
| `PATCH` | `/api/bookings/:id/confirm` | Confirm a booking (atomically reduces seats) |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel a booking (restores seats) |

### Other

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/passengers` | List passengers |
| `GET` | `/api/notifications` | Company notifications |
| `GET` | `/api/audit-logs` | Company audit trail |
| `GET` | `/health` | Health check |

All successful responses follow this envelope:

```json
{
  "success": true,
  "message": "Bookings loaded",
  "data": []
}
```

All field names in responses are **camelCase**, even though the database uses snake_case.

---

## Roles & Permissions

| Role | Scope |
|---|---|
| `super_admin` | Full access across all companies |
| `company_owner` | Full access within their own company |
| `manager` | Operational management within their company |
| `agent` | Passenger and booking management |
| `driver` | Read access to assigned trips and bookings |
| `customer` | Search trips, create and manage own bookings |

Authentication uses Supabase OTP. The frontend obtains a Supabase access token and passes it as a Bearer token on every backend request. The backend verifies it, loads the user's profile, and enforces role/permission checks before any data is touched.

---

## Data Isolation

Tenant isolation is enforced at two independent layers:

1. **API layer** — every company-scoped service call resolves and validates `companyId` before reading or writing data
2. **Database layer** — Supabase Row Level Security policies in `rls.sql` block direct data access that bypasses the API

Seat booking is protected by Postgres RPC functions (`confirm_booking`, `cancel_booking`) that are revoked from the `anon` and `authenticated` roles and granted only to `service_role`, preventing clients from bypassing backend authorization.

---

## Future Integrations

- **M-Pesa**: Payment callbacks update `payment_status` then trigger booking confirmation
- **USSD**: Feature-phone booking flow via Africa's Talking, routing through the same booking services
- **SMS / WhatsApp**: Notification delivery plugs into `notification.service.ts`
