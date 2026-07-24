import { getSupabase } from '@/lib/supabase';
import type { ExerciseHistory, NewExerciseHistory } from './types';

const TABLE = 'exercise_history' as const;

export interface SaveResult {
  data: ExerciseHistory | null;
  error: string | null;
}

/**
 * Inserts one exercise session into exercise_history.
 * RLS enforces that user_id must match the authenticated user.
 */
export async function saveExerciseHistory(
  entry: NewExerciseHistory
): Promise<SaveResult> {
  const sb = getSupabase();
  if (!sb) return { data: null, error: 'Supabase not configured.' };

  const { data, error } = await sb
    .from(TABLE)
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error('[history] saveExerciseHistory:', error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}
