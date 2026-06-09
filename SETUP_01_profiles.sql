-- ============================================================
-- SETUP_01: Helper function only
-- Run this FIRST. Nothing depends on it yet.
-- ============================================================

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
