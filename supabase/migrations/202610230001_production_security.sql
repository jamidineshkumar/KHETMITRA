-- KhetMitra production hardening migration
-- Apply in Supabase SQL Editor after reviewing the current deployment.
-- Client/browser users may read data after authentication, but may not fabricate
-- hardware telemetry or alerts. A trusted device-ingestion service should write
-- these records using server-side credentials (never expose service-role keys).

begin;

-- Remove previously permissive policies shipped by the original schema.
drop policy if exists "Allow authenticated users to read alerts" on public.field_alerts;
drop policy if exists "Allow inserts to field_alerts" on public.field_alerts;
drop policy if exists "Allow updates to field_alerts" on public.field_alerts;
drop policy if exists "Allow read access to device_telemetry" on public.device_telemetry;
drop policy if exists "Allow insert/update to device_telemetry" on public.device_telemetry;

alter table public.field_alerts enable row level security;
alter table public.device_telemetry enable row level security;
alter table public.farmer_profiles enable row level security;

-- Authenticated farmers can read persisted alert history. Browser clients cannot
-- insert or alter alerts; only trusted ingestion/admin services should do that.
create policy "Authenticated users can read field alerts"
  on public.field_alerts for select
  to authenticated
  using (auth.uid() is not null);

-- Demo-only inserts are explicitly labelled and never trigger physical hardware.
-- Production admin authorization should replace this broad authenticated demo policy.
drop policy if exists "Authenticated users can create labelled demo alerts" on public.field_alerts;
create policy "Authenticated users can create labelled demo alerts"
  on public.field_alerts for insert
  to authenticated
  with check (
    auth.uid() is not null
    and notes like '[DEMO ALERT]%'
    and sensor_id like 'DEMO-%'
    and animal = 'Demo wildlife detection'
  );

-- Telemetry is read-only to signed-in clients. No browser role can forge readings.
create policy "Authenticated users can read device telemetry"
  on public.device_telemetry for select
  to authenticated
  using (auth.uid() is not null);

-- Ensure farmer profiles are private to their owner.
drop policy if exists "Users can view their own profile" on public.farmer_profiles;
drop policy if exists "Users can update their own profile" on public.farmer_profiles;
drop policy if exists "Users can insert their own profile" on public.farmer_profiles;

create policy "Users can view their own profile"
  on public.farmer_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.farmer_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.farmer_profiles for insert
  to authenticated
  with check (auth.uid() = id);

commit;

-- IMPORTANT:
-- 1. Remove the baseline INSERT statements from supabase_schema.sql before using
--    it for a fresh production database; those records are sample data.
-- 2. This migration does not delete existing sample rows. Review and remove
--    confirmed sample records manually after backing up the production database.
-- 3. Device ingestion is intentionally not implemented here. Use an authenticated
--    Edge Function/API that validates device identity and payloads, or a securely
--    provisioned device-specific credential. Never embed service-role credentials
--    in firmware or frontend code.
