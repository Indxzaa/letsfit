import { getSupabase } from '@/lib/supabase';
import type { ExerciseHistory } from './types';

const TABLE = 'exercise_history' as const;

/** Most recent `limit` sessions across all exercises. */
export async function getRecentHistory(limit = 20): Promise<ExerciseHistory[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[history] getRecentHistory:', error.message);
    return [];
  }
  return data ?? [];
}

/** All sessions for a specific exercise, newest first. */
export async function getHistoryByExercise(
  exerciseName: string,
  limit = 50
): Promise<ExerciseHistory[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .eq('exercise_name', exerciseName)
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[history] getHistoryByExercise:', error.message);
    return [];
  }
  return data ?? [];
}

export interface PaginatedResult {
  data: ExerciseHistory[];
  count: number;
  hasMore: boolean;
}

/** Paginated history, newest first. `page` is 0-indexed. */
export async function getPaginatedHistory(
  page = 0,
  pageSize = 10
): Promise<PaginatedResult> {
  const sb = getSupabase();
  if (!sb) return { data: [], count: 0, hasMore: false };

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await sb
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('completed_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('[history] getPaginatedHistory:', error.message);
    return { data: [], count: 0, hasMore: false };
  }

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    hasMore: from + pageSize < total,
  };
}

/** Fetch a single history entry by its UUID. Returns null if not found or not owned by the current user. */
export async function getHistoryById(id: string): Promise<ExerciseHistory | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') console.error('[history] getHistoryById:', error.message);
    return null;
  }
  return data ?? null;
}

export interface FilteredHistoryOptions {
  page?: number;
  pageSize?: number;
  exerciseName?: string | null;
  search?: string | null;
  sort?: 'newest' | 'oldest';
}

/** Paginated, filterable history. */
export async function getFilteredHistory(
  opts: FilteredHistoryOptions = {}
): Promise<PaginatedResult> {
  const sb = getSupabase();
  if (!sb) return { data: [], count: 0, hasMore: false };

  const { page = 0, pageSize = 20, exerciseName, search, sort = 'newest' } = opts;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let q = sb
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('completed_at', { ascending: sort === 'oldest' })
    .range(from, to);

  if (exerciseName) {
    q = q.eq('exercise_name', exerciseName);
  }
  if (search) {
    q = q.ilike('exercise_name', `%${search}%`);
  }

  const { data, error, count } = await q;

  if (error) {
    console.error('[history] getFilteredHistory:', error.message);
    return { data: [], count: 0, hasMore: false };
  }

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    hasMore: from + pageSize < total,
  };
}

export interface ExerciseAnalytics {
  totalSessions: number;
  avgAccuracy: number;
  bestAccuracy: number;
  totalRepetitions: number | null;
  totalDurationSeconds: number | null;
  lastCompleted: string;
}

/** Aggregate stats for a single exercise across all user sessions. */
export async function getExerciseAnalytics(exerciseName: string): Promise<ExerciseAnalytics | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from(TABLE)
    .select('accuracy_score, repetitions, duration_seconds, completed_at')
    .eq('exercise_name', exerciseName)
    .order('completed_at', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('[history] getExerciseAnalytics:', error.message);
    return null;
  }

  const rows = data ?? [];
  if (rows.length === 0) return null;

  let sumAccuracy = 0;
  let bestAccuracy = -Infinity;
  let sumReps = 0;
  let hasReps = false;
  let sumDuration = 0;
  let hasDuration = false;

  for (const row of rows) {
    sumAccuracy += row.accuracy_score;
    if (row.accuracy_score > bestAccuracy) bestAccuracy = row.accuracy_score;
    if (row.repetitions != null) { sumReps += row.repetitions; hasReps = true; }
    if (row.duration_seconds != null) { sumDuration += row.duration_seconds; hasDuration = true; }
  }

  return {
    totalSessions: rows.length,
    avgAccuracy: sumAccuracy / rows.length,
    bestAccuracy,
    totalRepetitions: hasReps ? sumReps : null,
    totalDurationSeconds: hasDuration ? sumDuration : null,
    lastCompleted: rows[0].completed_at,
  };
}

/** Distinct exercise names in user's history, for filter chips. */
export async function getHistoryExerciseNames(): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from(TABLE)
    .select('exercise_name')
    .order('exercise_name')
    .limit(1000);

  if (error) {
    console.error('[history] getHistoryExerciseNames:', error.message);
    return [];
  }

  const seen = new Set<string>();
  for (const row of data ?? []) seen.add(row.exercise_name);
  return Array.from(seen).sort();
}
