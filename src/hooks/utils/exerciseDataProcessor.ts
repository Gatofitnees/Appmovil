
import { ExerciseSession, ExerciseStats, WorkoutSession } from "../types/exerciseHistory";

interface RawExerciseData {
  id: number;
  exercise_id: number;
  weight_kg_used: number | null;
  reps_completed: number | null;
  rir?: number | null;
  partial_reps?: number | null;
  set_number: number;
  workout_log_id: number;
  workout_log: {
    workout_date: string;
    user_id: string;
  } | {
    workout_date: string;
    user_id: string;
  }[];
}

export const processExerciseData = (data: RawExerciseData[]): ExerciseStats => {
  if (!data || data.length === 0) {
    return {
      maxWeight: null,
      maxReps: null,
      sessions: [],
      progressData: []
    };
  }

  let globalMaxWeight = 0;
  let globalMaxReps = 0;

  // Group by date and then by workout_log_id
  const sessionsByDate = new Map<string, Map<number, WorkoutSession>>();

  data.forEach((entry) => {
    const workoutLog = Array.isArray(entry.workout_log)
      ? entry.workout_log[0]
      : entry.workout_log;

    if (!workoutLog?.workout_date) return;

    const displayDate = new Date(workoutLog.workout_date).toLocaleDateString('es-ES');
    const weight = entry.weight_kg_used || 0;
    const reps = entry.reps_completed || 0;

    // Calculate global statistics
    if (weight > globalMaxWeight) globalMaxWeight = weight;
    if (reps > globalMaxReps) globalMaxReps = reps;

    // Initialize date if not exists
    if (!sessionsByDate.has(displayDate)) {
      sessionsByDate.set(displayDate, new Map<number, WorkoutSession>());
    }

    const workoutsForDate = sessionsByDate.get(displayDate)!;

    // If workout exists for this workout_log_id, add the set
    if (workoutsForDate.has(entry.workout_log_id)) {
      const existingWorkout = workoutsForDate.get(entry.workout_log_id)!;

      existingWorkout.sets.push({
        set_number: entry.set_number,
        weight_kg_used: entry.weight_kg_used,
        reps_completed: entry.reps_completed,
        rir: entry.rir,
        partial_reps: entry.partial_reps
      });

      // Update workout statistics
      if (weight > (existingWorkout.maxWeight || 0)) {
        existingWorkout.maxWeight = weight;
      }
      existingWorkout.totalReps += reps;

    } else {
      // Create new workout for this workout_log_id
      workoutsForDate.set(entry.workout_log_id, {
        workout_log_id: entry.workout_log_id,
        workout_number: workoutsForDate.size + 1,
        sets: [{
          set_number: entry.set_number,
          weight_kg_used: entry.weight_kg_used,
          reps_completed: entry.reps_completed,
          rir: entry.rir,
          partial_reps: entry.partial_reps
        }],
        maxWeight: weight || null,
        totalReps: reps
      });
    }
  });

  // Convert Maps to ExerciseSession array
  const sessions = Array.from(sessionsByDate.entries()).map(([date, workoutsMap]) => {
    const workouts = Array.from(workoutsMap.values()).map(workout => ({
      ...workout,
      sets: workout.sets.sort((a, b) => a.set_number - b.set_number)
    }));

    // Sort workouts by workout_log_id to maintain consistent order
    workouts.sort((a, b) => a.workout_log_id - b.workout_log_id);

    // Assign sequential workout numbers
    workouts.forEach((workout, index) => {
      workout.workout_number = index + 1;
    });

    const dailyMaxWeight = Math.max(...workouts.map(w => w.maxWeight || 0)) || null;
    const dailyTotalReps = workouts.reduce((sum, w) => sum + w.totalReps, 0);

    return {
      date,
      workouts,
      dailyMaxWeight,
      dailyTotalReps
    };
  });

  // Sort sessions by date (most recent first)
  const sortedSessions = sessions.sort((a, b) => {
    const dateA = new Date(a.date.split('/').reverse().join('-'));
    const dateB = new Date(b.date.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });

  // Create progress data for chart (chronological order)
  const progressData = sortedSessions
    .filter(session => session.dailyMaxWeight && session.dailyMaxWeight > 0)
    .reverse() // Chronological order for the chart
    .map(session => ({
      date: session.date,
      maxWeight: session.dailyMaxWeight!
    }));

  return {
    maxWeight: globalMaxWeight || null,
    maxReps: globalMaxReps || null,
    sessions: sortedSessions,
    progressData
  };
};
