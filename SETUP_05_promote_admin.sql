-- ============================================================
-- SETUP_05: Promote your account to admin
-- Run LAST, AFTER signing up in the app with indyy8262@gmail.com
-- ============================================================

insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'indyy8262@gmail.com'
on conflict (user_id) do update set role = 'admin';

update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'indyy8262@gmail.com');

-- Verify: should return one row with role = 'admin'
select u.email, r.role
from auth.users u
join public.user_roles r on r.user_id = u.id
where u.email = 'indyy8262@gmail.com';
