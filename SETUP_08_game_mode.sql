-- ============================================================
-- SETUP_08: Add game_mode and battle_rounds to rooms table
-- Run in Supabase SQL Editor after SETUP_06 and SETUP_07
-- ============================================================

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS game_mode TEXT NOT NULL DEFAULT 'freestyle'
  CHECK (game_mode IN ('freestyle', 'battle'));

ALTER TABLE public.rooms
  ADD COLUMN IF NOT EXISTS battle_rounds INTEGER NOT NULL DEFAULT 3
  CHECK (battle_rounds IN (3, 5, 10));
