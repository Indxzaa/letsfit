-- ============================================================
-- LetsFit Admin System — run this in Supabase SQL Editor
-- ============================================================

-- 1. user_roles table (source of truth for roles)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  granted_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- Users can read their own role (needed for client-side checks)
create policy "users can read own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Only service role / admin function can write roles (no client writes)
create policy "no client writes to roles"
  on public.user_roles for insert
  with check (false);

create policy "no client updates to roles"
  on public.user_roles for update
  using (false);

-- 2. Helper: check if a user is admin (used in RLS policies)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = uid and role = 'admin'
  );
$$;

-- 3. Extend profiles table with admin_notes column (optional but useful)
alter table public.profiles
  add column if not exists role text not null default 'user';

-- 4. Admin-only view: all users with their progress data
create or replace view public.admin_users_view as
  select
    p.id,
    p.username,
    p.role,
    p.updated_at,
    (p.data->>'xp')::int                        as xp,
    (p.data->>'fitCoins')::int                  as fit_coins,
    (p.data->>'totalSessions')::int             as total_sessions,
    (p.data->>'totalReps')::int                 as total_reps,
    jsonb_array_length(coalesce(p.data->'unlockedAchievements','[]'::jsonb)) as achievement_count,
    jsonb_array_length(coalesce(p.data->'unlockedItems','[]'::jsonb))        as unlocked_items
  from public.profiles p;

-- Restrict view to admins only
alter view public.admin_users_view owner to authenticator;
-- RLS via function (the view runs as authenticator, check is_admin)
create policy "admins can select admin_users_view"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.is_admin(auth.uid())
  );

-- 5. Seed your admin account
-- Replace the email if needed; this uses a subquery to find the user id.
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'indyy8262@gmail.com'
on conflict (user_id) do update set role = 'admin';

-- Also mark the profiles row
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'indyy8262@gmail.com');

-- 6. Auto-insert a role row for every new signup (default 'user')
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict do nothing;

  update public.profiles set role = 'user' where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_role_created on auth.users;
create trigger on_auth_user_role_created
  after insert on auth.users
  for each row execute function public.handle_new_user_role();
