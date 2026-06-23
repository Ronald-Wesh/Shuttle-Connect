create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum (
    'super_admin',
    'company_owner',
    'manager',
    'agent',
    'driver',
    'customer'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.trip_status as enum (
    'scheduled',
    'boarding',
    'departed',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.booking_status as enum (
    'pending',
    'confirmed',
    'cancelled',
    'expired'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum (
    'pending',
    'paid',
    'failed',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_channel as enum (
    'in_app',
    'sms',
    'email',
    'whatsapp'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.vehicle_status as enum (
    'active',
    'maintenance',
    'inactive'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  full_name text,
  role public.app_role not null default 'customer',
  company_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text unique,
  phone text,
  email text,
  owner_id uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  alter table public.profiles
    add constraint profiles_company_id_fkey
    foreign key (company_id)
    references public.companies(id)
    on delete set null;
exception
  when duplicate_object then null;
end $$;

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  origin text not null,
  destination text not null,
  distance_km numeric(8, 2),
  estimated_duration_minutes integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint routes_different_points check (lower(origin) <> lower(destination))
);

create unique index if not exists routes_company_origin_destination_idx
  on public.routes (company_id, lower(origin), lower(destination));

create unique index if not exists routes_id_company_idx
  on public.routes (id, company_id);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  plate_number text not null,
  model text,
  seat_capacity integer not null,
  status public.vehicle_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicles_positive_seat_capacity check (seat_capacity > 0)
);

create unique index if not exists vehicles_company_plate_number_idx
  on public.vehicles (company_id, upper(plate_number));

create unique index if not exists vehicles_id_company_idx
  on public.vehicles (id, company_id);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  route_id uuid not null references public.routes(id) on delete restrict,
  vehicle_id uuid references public.vehicles(id) on delete restrict,
  vehicle_name text,
  vehicle_registration text,
  departure_time timestamptz not null,
  arrival_time timestamptz,
  fare_amount numeric(12, 2) not null,
  total_seats integer not null,
  available_seats integer not null,
  status public.trip_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_positive_fare check (fare_amount > 0),
  constraint trips_positive_total_seats check (total_seats > 0),
  constraint trips_valid_available_seats check (
    available_seats >= 0 and available_seats <= total_seats
  )
);

create index if not exists trips_company_departure_idx
  on public.trips (company_id, departure_time);

create index if not exists trips_route_departure_idx
  on public.trips (route_id, departure_time);

create unique index if not exists trips_id_company_idx
  on public.trips (id, company_id);

do $$
begin
  alter table public.trips
    add column if not exists vehicle_id uuid references public.vehicles(id) on delete restrict;
exception
  when duplicate_column then null;
end $$;

create index if not exists trips_vehicle_departure_idx
  on public.trips (vehicle_id, departure_time);

do $$
begin
  alter table public.trips
    add constraint trips_route_company_fkey
    foreign key (route_id, company_id)
    references public.routes(id, company_id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.trips
    add constraint trips_vehicle_company_fkey
    foreign key (vehicle_id, company_id)
    references public.vehicles(id, company_id);
exception
  when duplicate_object then null;
end $$;

create table if not exists public.passengers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  national_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists passengers_company_phone_idx
  on public.passengers (company_id, phone);

create unique index if not exists passengers_id_company_idx
  on public.passengers (id, company_id);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete restrict,
  passenger_id uuid not null references public.passengers(id) on delete restrict,
  booking_reference text not null unique,
  seat_count integer not null,
  total_amount numeric(12, 2) not null,
  status public.booking_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_positive_seats check (seat_count > 0),
  constraint bookings_positive_total check (total_amount >= 0)
);

create index if not exists bookings_company_created_idx
  on public.bookings (company_id, created_at desc);

create index if not exists bookings_trip_idx
  on public.bookings (trip_id);

create index if not exists bookings_passenger_idx
  on public.bookings (passenger_id);

do $$
begin
  alter table public.bookings
    add constraint bookings_trip_company_fkey
    foreign key (trip_id, company_id)
    references public.trips(id, company_id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.bookings
    add constraint bookings_passenger_company_fkey
    foreign key (passenger_id, company_id)
    references public.passengers(id, company_id);
exception
  when duplicate_object then null;
end $$;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_company_created_idx
  on public.audit_logs (company_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  recipient_user_id uuid references public.profiles(id) on delete set null,
  recipient_phone text,
  title text not null,
  message text not null,
  channel public.notification_channel not null default 'in_app',
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_company_created_idx
  on public.notifications (company_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists set_routes_updated_at on public.routes;
create trigger set_routes_updated_at
before update on public.routes
for each row execute function public.set_updated_at();

drop trigger if exists set_vehicles_updated_at on public.vehicles;
create trigger set_vehicles_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

drop trigger if exists set_trips_updated_at on public.trips;
create trigger set_trips_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

drop trigger if exists set_passengers_updated_at on public.passengers;
create trigger set_passengers_updated_at
before update on public.passengers
for each row execute function public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, full_name)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.confirm_booking(
  p_booking_id uuid,
  p_actor_id uuid default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_trip public.trips%rowtype;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.status = 'confirmed' then
    return v_booking;
  end if;

  if v_booking.status <> 'pending' then
    raise exception 'Only pending bookings can be confirmed';
  end if;

  select * into v_trip
  from public.trips
  where id = v_booking.trip_id
  for update;

  if not found then
    raise exception 'Trip not found';
  end if;

  if v_trip.status not in ('scheduled', 'boarding') then
    raise exception 'Bookings are closed for this trip';
  end if;

  if v_trip.available_seats < v_booking.seat_count then
    raise exception 'Not enough seats are available for this trip';
  end if;

  update public.trips
  set available_seats = available_seats - v_booking.seat_count
  where id = v_trip.id;

  update public.bookings
  set status = 'confirmed',
      confirmed_at = now()
  where id = v_booking.id
  returning * into v_booking;

  insert into public.audit_logs (
    company_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_booking.company_id,
    p_actor_id,
    'booking.confirmed.rpc',
    'booking',
    v_booking.id,
    jsonb_build_object('bookingReference', v_booking.booking_reference)
  );

  return v_booking;
end;
$$;

create or replace function public.cancel_booking(
  p_booking_id uuid,
  p_actor_id uuid default null,
  p_reason text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if v_booking.status = 'cancelled' then
    return v_booking;
  end if;

  if v_booking.status = 'confirmed' then
    update public.trips
    set available_seats = least(total_seats, available_seats + v_booking.seat_count)
    where id = v_booking.trip_id;
  end if;

  update public.bookings
  set status = 'cancelled',
      cancelled_at = now()
  where id = v_booking.id
  returning * into v_booking;

  insert into public.audit_logs (
    company_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_booking.company_id,
    p_actor_id,
    'booking.cancelled.rpc',
    'booking',
    v_booking.id,
    jsonb_build_object(
      'bookingReference',
      v_booking.booking_reference,
      'reason',
      p_reason
    )
  );

  return v_booking;
end;
$$;

revoke execute on function public.confirm_booking(uuid, uuid) from public;
revoke execute on function public.confirm_booking(uuid, uuid) from anon;
revoke execute on function public.confirm_booking(uuid, uuid) from authenticated;
grant execute on function public.confirm_booking(uuid, uuid) to service_role;

revoke execute on function public.cancel_booking(uuid, uuid, text) from public;
revoke execute on function public.cancel_booking(uuid, uuid, text) from anon;
revoke execute on function public.cancel_booking(uuid, uuid, text) from authenticated;
grant execute on function public.cancel_booking(uuid, uuid, text) to service_role;
