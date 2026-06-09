# Supabase Setup for LetsFit

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**, fill in a name and password, pick a region
3. Wait ~1 minute for the project to provision

## 2. Add your API keys

1. In your project: **Project Settings → API**
2. Copy **Project URL** and **anon / public key**
3. In `c:\mywebsite\letsfit`, copy `.env.local.example` → `.env.local` and fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi....
```

4. Restart the dev server

## 3. Disable email confirmation (dev only)

In Supabase: **Authentication → Settings → Email auth**
- Turn off **Confirm email** so signups work instantly during development

## 4. Run the database setup SQL

Open **SQL Editor** in your Supabase dashboard. For each file below, click
**New query**, paste the entire file contents, and click **Run**.

**Run in this exact order:**

| Step | File | What it creates |
|------|------|-----------------|
| 1 | `SETUP_01_profiles.sql` | `is_admin()` helper function |
| 2 | `SETUP_02_roles.sql` | `user_roles` table + signup trigger |
| 3 | `SETUP_03_profiles.sql` | `profiles` table + signup trigger |
| 4 | `SETUP_04_admin_view.sql` | `admin_users_view` |
| 5 | Sign up in the app first, then run `SETUP_05_promote_admin.sql` | Grants admin to `indyy8262@gmail.com` |

Each file is in `c:\mywebsite\letsfit\`. After step 4, sign up at
`http://localhost:3000` with `indyy8262@gmail.com` before running step 5.

After step 5 succeeds you should see a result row:

| email | role |
|---|---|
| indyy8262@gmail.com | admin |

## 5. Verify the admin panel

1. Sign in with `indyy8262@gmail.com`
2. The navbar shows an **Admin** link
3. `/admin` lists all users with FitCoin controls, role management, and progress reset

---

## Troubleshooting

**"function public.is_admin does not exist"** — You skipped `SETUP_01`. Run it first.

**"relation public.user_roles does not exist"** — Run `SETUP_01` then `SETUP_02`.

**"relation public.profiles does not exist"** — Run files 01–03 in order.

**`SETUP_05` returns 0 rows** — You haven't signed up yet. Sign up in the app first.

**"Invalid login credentials"** — Wrong password, or email confirmation is still on (disable it in Auth → Settings).

**Sessions don't persist after refresh** — Don't use incognito mode; localStorage must be available.
