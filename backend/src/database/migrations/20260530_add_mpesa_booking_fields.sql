alter table public.bookings
  add column if not exists checkout_request_id text,
  add column if not exists mpesa_receipt text,
  add column if not exists payment_failed_reason text;

create index if not exists bookings_checkout_request_id_idx
  on public.bookings (checkout_request_id)
  where checkout_request_id is not null;
