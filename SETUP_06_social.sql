-- ════════════════════════════════════════════════════════════════════
-- Phase 6.2 — Social Layer: Friends, Presence, Invites
-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- After running: enable Realtime for friends + invites tables in
--   Dashboard → Database → Replication
-- ════════════════════════════════════════════════════════════════════

-- ── friends ──────────────────────────────────────────────────────────
CREATE TABLE public.friends (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'accepted')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);

CREATE INDEX friends_requester_idx ON public.friends (requester_id);
CREATE INDEX friends_addressee_idx ON public.friends (addressee_id);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friends_select" ON public.friends
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "friends_insert" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "friends_update" ON public.friends
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "friends_delete" ON public.friends
  FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ── invites ──────────────────────────────────────────────────────────
CREATE TABLE public.invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id    UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_user <> to_user)
);

CREATE INDEX invites_to_user_pending_idx ON public.invites (to_user, status)
  WHERE status = 'pending';
CREATE INDEX invites_from_user_idx ON public.invites (from_user);

ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_select" ON public.invites
  FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user);

CREATE POLICY "invites_insert" ON public.invites
  FOR INSERT WITH CHECK (auth.uid() = from_user);

CREATE POLICY "invites_update" ON public.invites
  FOR UPDATE USING (auth.uid() = from_user OR auth.uid() = to_user);

-- ── presence ──────────────────────────────────────────────────────────
-- Persists last_seen + status so offline friends still show their
-- last known activity. Live status rides on Supabase Realtime Presence.
CREATE TABLE public.presence (
  user_id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'offline'
                   CHECK (status IN (
                     'online', 'offline',
                     'in_lobby', 'in_workout', 'in_round', 'in_invite_screen'
                   )),
  current_activity TEXT,
  last_seen        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presence_select" ON public.presence
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "presence_insert" ON public.presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "presence_update" ON public.presence
  FOR UPDATE USING (auth.uid() = user_id);
