-- ============================================================
-- SETUP_02: user_roles table
-- Run AFTER SETUP_01 (is_admin function must exist first)
-- ============================================================

create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'user' check (role in ('user', 'admin')),
  granted_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- Users can read their own role
create policy "users can read own role"
  on public.user_roles for select
  using (auth.uid() = user_id);


-- Auto-insert 'user' role for every new signup
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_role_created on auth.users;
create trigger on_auth_user_role_created
  after insert on auth.users
  for each row execute function public.handle_new_user_role();
