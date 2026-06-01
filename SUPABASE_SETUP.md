# Supabase Setup for LetsFit

LetsFit uses Supabase for authentication and (optionally) cloud-syncing your
progress. This guide walks through getting it running locally in about 5 minutes.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in (free tier is fine).
2. Click **New project**.
3. Fill in:
   - **Name**: `letsfit` (anything)
   - **Database Password**: pick a strong password (you won't need it for the app)
   - **Region**: closest to you
4. Click **Create new project** and wait ~1 minute for provisioning.

## 2. Copy your API keys

In your project dashboard:

1. Click **Project Settings** (gear icon, bottom-left)
2. Click **API** in the sidebar
3. You'll see two values you need:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon / public key** — a long `eyJ...` JWT string

## 3. Add the keys to `.env.local`

In the project root (`c:\mywebsite\letsfit`):

1. Copy `.env.local.example` to `.env.local`
2. Paste your two values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi....your-long-key....
```

3. Restart your dev server (`Ctrl+C`, then `npm run dev`).

The "Authentication is not configured" warning should now be gone.

## 4. Configure auth settings

In your Supabase dashboard:

1. Go to **Authentication → Providers**
2. **Email** is enabled by default — keep it on.
3. Go to **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (for dev)
   - **Redirect URLs**: add `http://localhost:3000/**`
4. Go to **Authentication → Settings**:
   - For local dev, you can disable **Confirm email** so signups work without
     receiving a confirmation email. (For production, leave it on.)

## 5. (Optional) Create the `profiles` table

LetsFit can cloud-sync your XP, FitCoins, streaks, achievements, and equipped
cosmetics across devices. To enable this, create a `profiles` table.

In your Supabase dashboard go to **SQL Editor → New query**, paste this, and run:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

That's it. Sign up in the app — your XP and FitCoins will now persist to
the cloud and follow you to other devices. If you skip this step, the app
falls back to localStorage.

---

## Troubleshooting

**"Invalid login credentials"** — wrong email or password, or the user hasn't
confirmed their email. Either disable email confirmation (step 4) or check your
inbox for the confirmation link.

**"Email rate limit exceeded"** — Supabase free tier rate-limits signup emails.
Disable email confirmation for dev or wait an hour.

**Sessions don't persist after refresh** — make sure you're not running in an
incognito window with localStorage blocked.

**Profiles table not syncing** — check the SQL ran without errors and that RLS
policies are active. Look in **Authentication → Users** to confirm a row exists,
then in **Table Editor → profiles**.
  