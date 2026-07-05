-- ============================================================
-- SETUP_07: Allow authenticated users to search profiles by username
--
-- Root cause: the existing SELECT policy on public.profiles is
--   `auth.uid() = id` — users can only read their own row.
-- Any search for another user's username returns [] silently.
--
-- Fix: add a permissive read policy for all authenticated users.
-- This is required for the friend search (Add Friend) feature.
-- The profiles.data column contains game state (XP, FitCoins)
-- which is acceptable to expose to authenticated users in a
-- social fitness app — players see each other's stats anyway.
-- ============================================================

-- Drop the old restrictive policy and replace it with one that
-- allows any authenticated user to read any profile row.
-- (The old policy already allows admins; this adds everyone else.)

DROP POLICY IF EXISTS "users can read own profile" ON public.profiles;

CREATE POLICY "profiles_read_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);
