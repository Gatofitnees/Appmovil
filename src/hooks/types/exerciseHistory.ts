
export interface WorkoutSession {
  workout_log_id: number;
  workout_number: number; // 1, 2, 3, etc. for same day
  sets: {
    set_number: number;
    weight_kg_used: number | null;
    reps_completed: number | null;
    rir?: number | null;
    partial_reps?: number | null;
  }[];
  maxWeight: number | null;
  totalReps: number;
}

export interface ExerciseSession {
  date: string;
  workouts: WorkoutSession[];
  dailyMaxWeight: number | null;
  dailyTotalReps: number;
}

export interface ExerciseStats {
  maxWeight: number | null;
  maxReps: number | null;
  sessions: ExerciseSession[];
  progressData: { date: string; maxWeight: number }[];
}

export interface UseExerciseHistoryProps {
  exerciseId?: number;
}

export interface ExerciseHistoryReturn {
  stats: ExerciseStats;
  loading: boolean;
  isEmpty: boolean;
}
