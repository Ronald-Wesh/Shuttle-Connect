insert into public.companies (
  id,
  name,
  registration_number,
  phone,
  email,
  is_active
)
values (
  '11111111-1111-1111-1111-111111111111',
  'ShuttleConnect Demo',
  'DEMO-SC-001',
  '+254700000000',
  'ops@shuttleconnect.test',
  true
)
on conflict (id) do nothing;

insert into public.routes (
  id,
  company_id,
  origin,
  destination,
  distance_km,
  estimated_duration_minutes
)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Nairobi',
  'Mombasa',
  482.00,
  510
)
on conflict (id) do nothing;

insert into public.vehicles (
  id,
  company_id,
  name,
  plate_number,
  model,
  seat_capacity,
  status
)
values (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'Executive Shuttle',
  'KDA 001S',
  'Toyota Hiace',
  14,
  'active'
)
on conflict (id) do nothing;

insert into public.trips (
  id,
  company_id,
  route_id,
  vehicle_id,
  vehicle_name,
  vehicle_registration,
  departure_time,
  arrival_time,
  fare_amount,
  total_seats,
  available_seats,
  status
)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '55555555-5555-5555-5555-555555555555',
  'Executive Shuttle',
  'KDA 001S',
  now() + interval '1 day',
  now() + interval '1 day 8 hours',
  1800.00,
  14,
  14,
  'scheduled'
)
on conflict (id) do nothing;

insert into public.passengers (
  id,
  company_id,
  full_name,
  phone,
  email
)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Demo Passenger',
  '+254711111111',
  'passenger@shuttleconnect.test'
)
on conflict (id) do nothing;
