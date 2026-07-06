-- ============================================================
-- SETUP_10: Add avatar_url column to profiles table
-- This separates the avatar URL from the progress data JSONB blob.
-- Previously, avatarUrl was stored inside profiles.data, which
-- profileSync.pushRemote could silently overwrite during syncs.
-- Run in Supabase SQL Editor after SETUP_09.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
