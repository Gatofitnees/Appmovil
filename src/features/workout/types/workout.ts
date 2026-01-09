
export interface WorkoutSet {
  set_number: number;
  weight: number | string | null;
  reps: number | null;
  notes: string;
  previous_weight: number | null;
  previous_reps: number | null;
  target_reps_min?: number;
  target_reps_max?: number;
  target_reps_range?: string;
}

export interface WorkoutExercise {
  id: number;
  name: string;
  sets: WorkoutSet[];
  muscle_group_main?: string;
  equipment_required?: string;
  notes: string; // Routine creator notes (instructor instructions)
  user_notes?: string; // User workout notes (personal notes during workout)
  rest_between_sets_seconds?: number;
}

export interface PreviousData {
  weight: number | null;
  reps: number | null;
}
