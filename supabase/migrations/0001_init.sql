-- SEO Autopilot — initial schema (Milestone 1: Foundations + Recommendations)
-- Includes future-phase tables (implementations, notes, tasks, audit_log) so no later migration is needed.
-- Run this in the Supabase SQL Editor.

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ---------- Enums ----------
create type user_role   as enum ('admin', 'viewer');
create type rec_type    as enum ('auto', 'manual');
create type rec_status  as enum ('pending', 'accepted', 'declined', 'implemented', 'failed');
create type impl_status as enum ('queued', 'running', 'merged', 'failed', 'manual');
create type task_status as enum ('open', 'done');

-- ---------- Tables ----------
create table clients (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  url               text,
  initial           text,
  siteguru_site_id  text,               -- the site domain, e.g. devonjoinery.co.uk
  github_repo       text,
  vercel_project_id text,
  fathom_site_id    text,
  platform          text,               -- 'nextjs' | 'wordpress' | ... (used from Phase 2)
  viewer_email      text,
  health            int,                -- 0-100, last known SiteGuru health score
  brief             jsonb not null default '{}'::jsonb,
  last_sync         timestamptz,
  created_by        uuid references auth.users (id) on delete set null,
  created_at        timestamptz not null default now()
);

create table profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       user_role not null default 'viewer',
  client_id  uuid references clients (id) on delete set null,  -- null for admins
  full_name  text,
  created_at timestamptz not null default now()
);

create table recommendations (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references clients (id) on delete cascade,
  source         text not null default 'siteguru',
  external_key   text not null,          -- SiteGuru check_name; idempotency key with client_id+source
  title          text not null,
  description    text,
  category       text,                   -- our slug, e.g. meta_title, canonical
  type           rec_type not null,
  status         rec_status not null default 'pending',
  severity       text,                   -- 'high' | 'medium' | ...
  affected_pages int,
  raw            jsonb,                  -- the original SiteGuru task, verbatim
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (client_id, source, external_key)
);

create table implementations (
  id                 uuid primary key default gen_random_uuid(),
  recommendation_id  uuid references recommendations (id) on delete set null,
  client_id          uuid not null references clients (id) on delete cascade,
  status             impl_status not null default 'queued',
  commit_sha         text,
  pr_url             text,
  deploy_url         text,
  applied_at         timestamptz not null default now()
);

create table notes (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients (id) on delete cascade,
  author_id  uuid references auth.users (id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients (id) on delete cascade,
  title        text not null,
  description  text,
  status       task_status not null default 'open',
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

create table audit_log (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references clients (id) on delete cascade,
  actor      text not null,              -- 'admin' | 'system' | user id
  action     text not null,              -- 'accepted' | 'declined' | 'reopened' | 'synced' | ...
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index recommendations_client_status_idx on recommendations (client_id, status);
create index recommendations_client_type_idx   on recommendations (client_id, type);
create index implementations_client_idx        on implementations (client_id);
create index notes_client_idx                  on notes (client_id);
create index tasks_client_idx                  on tasks (client_id);
create index audit_log_client_created_idx      on audit_log (client_id, created_at desc);
create index profiles_client_idx               on profiles (client_id);

-- ---------- RLS helpers (security definer to avoid recursive policy evaluation) ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.my_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from profiles where user_id = auth.uid();
$$;

-- ---------- Enable RLS ----------
alter table clients         enable row level security;
alter table profiles        enable row level security;
alter table recommendations enable row level security;
alter table implementations enable row level security;
alter table notes           enable row level security;
alter table tasks           enable row level security;
alter table audit_log       enable row level security;

-- ---------- Policies ----------
-- profiles: a user can read their own row; admins can do anything.
create policy profiles_self_select on profiles
  for select using (user_id = auth.uid() or is_admin());
create policy profiles_admin_all on profiles
  for all using (is_admin()) with check (is_admin());

-- clients: admins full; viewers may read only their own client.
create policy clients_admin_all on clients
  for all using (is_admin()) with check (is_admin());
create policy clients_viewer_read on clients
  for select using (id = my_client_id());

-- recommendations / implementations / notes / tasks / audit_log:
-- admins full; viewers read only rows for their own client.
create policy rec_admin_all on recommendations
  for all using (is_admin()) with check (is_admin());
create policy rec_viewer_read on recommendations
  for select using (client_id = my_client_id());

create policy impl_admin_all on implementations
  for all using (is_admin()) with check (is_admin());
create policy impl_viewer_read on implementations
  for select using (client_id = my_client_id());

create policy notes_admin_all on notes
  for all using (is_admin()) with check (is_admin());
create policy notes_viewer_read on notes
  for select using (client_id = my_client_id());

create policy tasks_admin_all on tasks
  for all using (is_admin()) with check (is_admin());
create policy tasks_viewer_read on tasks
  for select using (client_id = my_client_id());

create policy audit_admin_all on audit_log
  for all using (is_admin()) with check (is_admin());
create policy audit_viewer_read on audit_log
  for select using (client_id = my_client_id());
