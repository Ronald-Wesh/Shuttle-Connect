create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

create or replace function public.can_access_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_user_role() = 'super_admin'
    or public.current_user_company_id() = p_company_id,
    false
  )
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.routes enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.passengers enable row level security;
alter table public.bookings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
using (id = auth.uid() or public.current_user_role() = 'super_admin');

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (id = auth.uid() or public.current_user_role() = 'super_admin')
with check (id = auth.uid() or public.current_user_role() = 'super_admin');

drop policy if exists companies_select_scoped on public.companies;
create policy companies_select_scoped
on public.companies
for select
using (public.can_access_company(id));

drop policy if exists companies_update_owner on public.companies;
create policy companies_update_owner
on public.companies
for update
using (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager')
  and public.can_access_company(id)
)
with check (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager')
  and public.can_access_company(id)
);

drop policy if exists companies_insert_authenticated on public.companies;
create policy companies_insert_authenticated
on public.companies
for insert
with check (auth.uid() is not null);

drop policy if exists routes_select_scoped on public.routes;
create policy routes_select_scoped
on public.routes
for select
using (public.can_access_company(company_id));

drop policy if exists routes_write_staff on public.routes;
create policy routes_write_staff
on public.routes
for all
using (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager')
  and public.can_access_company(company_id)
)
with check (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager')
  and public.can_access_company(company_id)
);

drop policy if exists vehicles_select_scoped on public.vehicles;
create policy vehicles_select_scoped
on public.vehicles
for select
using (public.can_access_company(company_id));

drop policy if exists vehicles_write_staff on public.vehicles;
create policy vehicles_write_staff
on public.vehicles
for all
using (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager')
  and public.can_access_company(company_id)
)
with check (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager')
  and public.can_access_company(company_id)
);

drop policy if exists trips_select_scoped on public.trips;
create policy trips_select_scoped
on public.trips
for select
using (public.can_access_company(company_id));

drop policy if exists trips_write_staff on public.trips;
create policy trips_write_staff
on public.trips
for all
using (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager')
  and public.can_access_company(company_id)
)
with check (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager')
  and public.can_access_company(company_id)
);

drop policy if exists passengers_select_scoped on public.passengers;
create policy passengers_select_scoped
on public.passengers
for select
using (public.can_access_company(company_id) or user_id = auth.uid());

drop policy if exists passengers_write_staff on public.passengers;
create policy passengers_write_staff
on public.passengers
for all
using (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager', 'agent')
  and public.can_access_company(company_id)
)
with check (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager', 'agent')
  and public.can_access_company(company_id)
);

drop policy if exists bookings_select_scoped on public.bookings;
create policy bookings_select_scoped
on public.bookings
for select
using (
  public.can_access_company(company_id)
  or exists (
    select 1
    from public.passengers p
    where p.id = passenger_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists bookings_write_staff on public.bookings;
create policy bookings_write_staff
on public.bookings
for all
using (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager', 'agent')
  and public.can_access_company(company_id)
)
with check (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager', 'agent')
  and public.can_access_company(company_id)
);

drop policy if exists audit_logs_select_scoped on public.audit_logs;
create policy audit_logs_select_scoped
on public.audit_logs
for select
using (
  company_id is null
  or public.can_access_company(company_id)
);

drop policy if exists notifications_select_scoped on public.notifications;
create policy notifications_select_scoped
on public.notifications
for select
using (
  public.can_access_company(company_id)
  or recipient_user_id = auth.uid()
);

drop policy if exists notifications_write_staff on public.notifications;
create policy notifications_write_staff
on public.notifications
for all
using (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager', 'agent')
  and public.can_access_company(company_id)
)
with check (
  public.current_user_role() in ('super_admin', 'company_owner', 'manager', 'agent')
  and public.can_access_company(company_id)
);
