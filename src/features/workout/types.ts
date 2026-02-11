
export interface ExerciseItem {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  image_url?: string;
  thumbnail_url?: string;
}

export interface ExerciseSet {
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

export interface RoutineExercise extends ExerciseItem {
  exercise_id?: number;
  sets: ExerciseSet[];
  notes?: string;
}

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

// Fixed the error in the sync service by explicitly defining the difficulty level type
export interface Exercise extends ExerciseItem {
  difficulty_level?: DifficultyLevel;
  video_url?: string;
  description?: string;
}
