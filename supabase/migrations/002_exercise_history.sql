-- Migration: 002_exercise_history
-- Adds exercise_history table for tracking per-session exercise completions.

CREATE TABLE IF NOT EXISTS exercise_history (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name    TEXT        NOT NULL,
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  repetitions      INTEGER,
  accuracy_score   NUMERIC(5,2) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exercise_history_user_completed
  ON exercise_history (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_exercise_history_user_exercise
  ON exercise_history (user_id, exercise_name);

-- Row Level Security
ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own exercise history"
  ON exercise_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own exercise history"
  ON exercise_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
