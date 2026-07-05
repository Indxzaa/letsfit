-- Multiplayer rooms schema for Workout Together (Phase 2)
-- Run this in the Supabase SQL editor or via CLI.

-- ── Rooms ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.rooms (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code        TEXT        UNIQUE NOT NULL,
  host_user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           TEXT        NOT NULL DEFAULT 'lobby'
                               CHECK (status IN ('lobby','exercise_select','countdown','active','finished')),
  selected_exercise TEXT,
  duration_seconds INTEGER     NOT NULL DEFAULT 300,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Room players ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.room_players (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    UUID        NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT        NOT NULL DEFAULT '',
  is_ready   BOOLEAN     NOT NULL DEFAULT FALSE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_id, user_id)
);

-- ── updated_at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS rooms_updated_at ON public.rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- rooms: authenticated users can read any room (needed to join by code)
CREATE POLICY "rooms_read_all"   ON public.rooms FOR SELECT TO authenticated USING (true);
-- rooms: only host can update/delete
CREATE POLICY "rooms_insert_own" ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (host_user_id = auth.uid());
CREATE POLICY "rooms_update_own" ON public.rooms FOR UPDATE TO authenticated
  USING (host_user_id = auth.uid());
CREATE POLICY "rooms_delete_own" ON public.rooms FOR DELETE TO authenticated
  USING (host_user_id = auth.uid());

-- room_players: authenticated users can read all participants of a room
CREATE POLICY "players_read_all"   ON public.room_players FOR SELECT TO authenticated USING (true);
-- room_players: users can only insert their own row
CREATE POLICY "players_insert_own" ON public.room_players FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
-- room_players: users can only update their own row (e.g. ready status)
CREATE POLICY "players_update_own" ON public.room_players FOR UPDATE TO authenticated
  USING (user_id = auth.uid());
-- room_players: users can only delete their own row (leave room)
CREATE POLICY "players_delete_own" ON public.room_players FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── Realtime ───────────────────────────────────────────────────────────────
-- Enable Realtime for the room_players table so the lobby updates live.
-- Run in Supabase dashboard: Database → Replication → enable room_players.
-- Or via CLI: supabase realtime enable --table room_players
