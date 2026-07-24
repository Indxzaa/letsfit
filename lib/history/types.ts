export interface ExerciseHistory {
  id: string;
  user_id: string;
  exercise_name: string;
  completed_at: string;
  duration_seconds: number | null;
  repetitions: number | null;
  accuracy_score: number;
  created_at: string;
}

/** Payload for inserting a new row — id, created_at, completed_at are server-defaults. */
export type NewExerciseHistory = Omit<ExerciseHistory, 'id' | 'created_at' | 'completed_at'> & {
  completed_at?: string;
};
