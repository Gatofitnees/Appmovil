
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkoutExercise } from "../types/workout";
import { useLocalTimezone } from "@/hooks/useLocalTimezone";
import { useStreaks } from "@/hooks/useStreaks";
import { useWorkoutPerformance, PerformanceStats } from "./useWorkoutPerformance";

export function useSaveWorkout(
  routine: any | null,
  workoutStartTime: Date,
  exercises: WorkoutExercise[],
  clearTemporaryExercises?: () => void,
  routineId?: number,
  clearCache?: () => void
) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { createLocalTimestamp } = useLocalTimezone();
  const streak = useStreaks();

  // Summary Modal State
  const performance = useWorkoutPerformance();
  const [showSummary, setShowSummary] = useState(false);
  const [summaryStats, setSummaryStats] = useState<PerformanceStats | null>(null);
  const [xpGained, setXpGained] = useState(0);
  const [finalDuration, setFinalDuration] = useState(0);

  const estimateCaloriesBurned = (durationMinutes: number): number => {
    const baseCaloriesPerMinute = 8;
    return Math.round(durationMinutes * baseCaloriesPerMinute);
  };

  // Helper function to convert weight to number for validation and saving
  const convertWeightToNumber = (weight: string | number | null): number | null => {
    if (weight === null || weight === undefined) return null;
    if (typeof weight === 'number') return weight;
    if (typeof weight === 'string') {
      const numValue = parseFloat(weight);
      return isNaN(numValue) ? null : numValue;
    }
    return null;
  };

  // Helper function to validate a set before saving - improved validation
  const isValidSet = (set: any) => {
    const hasValidSetNumber = set.set_number !== null &&
      set.set_number !== undefined &&
      set.set_number > 0 &&
      Number.isInteger(set.set_number);

    // Convert weight to number for validation
    const weightAsNumber = convertWeightToNumber(set.weight);

    // Allow sets with either weight OR reps (or both)
    const hasData = (weightAsNumber !== null && weightAsNumber > 0) ||
      (set.reps !== null && set.reps !== undefined && set.reps > 0);

    if (!hasValidSetNumber) {
      console.warn("Invalid set_number:", set.set_number);
      return false;
    }

    if (!hasData) {
      console.warn("Set has no weight or reps data:", set);
      return false;
    }

    return true;
  };

  // Helper function to clear stored data after successful save
  const clearStoredData = () => {
    if (routineId) {
      const baseStorageKey = `base_exercise_data_${routineId}`;
      const tempStorageKey = `temp_exercises_${routineId}`;

      sessionStorage.removeItem(baseStorageKey);
      sessionStorage.removeItem(tempStorageKey);
      console.log("Cleared all stored exercise data after successful save");
    }
  };

  const handleSaveWorkout = async () => {
    try {
      setIsSaving(true);

      if (!routine) {
        throw new Error("Rutina no encontrada");
      }

      const workoutDuration = Math.round(
        (new Date().getTime() - workoutStartTime.getTime()) / (1000 * 60)
      );

      console.log("Saving workout with exercises:", exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        setsCount: ex.sets.length,
        setsWithData: ex.sets.filter(s => {
          const weightAsNumber = convertWeightToNumber(s.weight);
          return (weightAsNumber !== null && weightAsNumber > 0) || (s.reps !== null && s.reps > 0);
        }).length,
        validSets: ex.sets.filter(isValidSet).length
      })));

      // Use local timestamp for saving to ensure it aligns with user's specific day view
      // This "lies" to the DB about timezone (treating local time as UTC) but ensures date-equality queries work efficiently for the user's perspective.
      const workoutDateForDB = createLocalTimestamp(new Date());
      // Usar fecha local para el racha (Date)
      const localDateForStreak = workoutDateForDB; // Renamed for clarity, it's the same local timestamp

      console.log('Saving workout with Local date (for DB):', workoutDateForDB);
      console.log('Local date string for streak:', localDateForStreak);

      // Save workout log
      const { data: workoutLog, error: workoutError } = await supabase
        .from('workout_logs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          routine_id: routine.id,
          routine_name_snapshot: routine.name,
          duration_completed_minutes: workoutDuration,
          calories_burned_estimated: estimateCaloriesBurned(workoutDuration),
          notes: "",
          workout_date: workoutDateForDB // Guardar como UTC real
        })
        .select()
        .single();

      if (workoutError || !workoutLog) {
        throw workoutError || new Error("No se pudo guardar el entrenamiento");
      }

      // Prepare exercise details with improved validation
      const exerciseDetailsToSave = exercises.flatMap((exercise) => {
        const validSets = exercise.sets.filter(isValidSet);

        if (validSets.length === 0) {
          console.warn(`Exercise ${exercise.name} has no valid sets, skipping`);
          return [];
        }

        return validSets.map(set => {
          // Convert weight to number for database storage
          const weightAsNumber = convertWeightToNumber(set.weight);

          const detail = {
            workout_log_id: workoutLog.id,
            exercise_id: exercise.id,
            exercise_name_snapshot: exercise.name,
            set_number: set.set_number,
            weight_kg_used: weightAsNumber,
            reps_completed: set.reps || null,
            notes: exercise.notes || ""
          };

          console.log(`Preparing to save: Exercise ${exercise.id}, Set ${set.set_number}`, detail);
          return detail;
        });
      });

      console.log("Exercise details to save (total valid sets):", exerciseDetailsToSave.length);
      console.log("Details preview:", exerciseDetailsToSave.slice(0, 3));

      if (exerciseDetailsToSave.length > 0) {
        const { error: detailsError } = await supabase
          .from('workout_log_exercise_details')
          .insert(exerciseDetailsToSave);

        if (detailsError) {
          console.error("Error saving exercise details:", detailsError);
          throw detailsError;
        }

        console.log("Successfully saved all exercise details");
      } else {
        console.warn("No valid exercise details to save");
      }

      // Update user streak immediately after workout (Backend)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("Updating streak for user:", user.id);
          // Update streak (new logic calls RPC)
          // p_client_date expects YYYY-MM-DD. Since workoutDateForDB is local timestamp string, we can split it.
          await supabase.rpc('update_user_streak_v2', {
            p_user_id: user.id,
            p_client_date: localDateForStreak.split('T')[0] // Use the saved local date
          });

          // Note: We DO NOT refetch streak immediately here.
          // We wait until the user closes the summary modal to trigger the UI update and Modal.
        }
      } catch (streakError) {
        console.error("Error updating streak:", streakError);
      }

      // Calculate Performance for Summary
      const stats = await performance.calculatePerformance(exercises, workoutLog.id);
      setSummaryStats(stats);
      setFinalDuration(workoutDuration);

      // Check daily workouts count to determine XP
      let calculatedXp = 25; // Default base XP
      try {
        // Query workouts for today (using the same date logic as streak)
        // We use the start of the day in UTC as a rough check, or better, rely on the client date string match if possible.
        // But since we just inserted with `workoutDateForDB` (a timestamp), we can query by range or simply count for today's date string.

        // Actually simplest is to count logs for this user where workout_date is today (local date we just used).
        // Since we are "lying" about timezone in DB by storing local time as absolute, we can match the day.
        const todayStart = new Date(localDateForStreak);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(localDateForStreak);
        todayEnd.setHours(23, 59, 59, 999);

        const { count, error: countError } = await supabase
          .from('workout_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .gte('workout_date', todayStart.toISOString())
          .lte('workout_date', todayEnd.toISOString());

        if (!countError && count !== null && count > 1) {
          console.log("Detectado segundo entrenamiento del día. XP = 0");
          calculatedXp = 0;
        } else {
          console.log("Primer entrenamiento del día (o error en conteo). XP = 25. Count:", count);
        }
      } catch (e) {
        console.error("Error checking daily workout count:", e);
      }

      setXpGained(calculatedXp);
      setShowSummary(true);

      // We do NOT navigate yet. Navigation happens in handleCloseSummary.

      // Clear data logic deferred to handleCloseSummary

    } catch (error: any) {
      console.error("Error al guardar entrenamiento:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el entrenamiento. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSummary = async () => {
    // 1. Refetch is DEFERRED to UserHeader animation completion to allow XP particles to fly first.
    //    We pass a flag to the destination route.

    // 2. Clear caches
    clearStoredData();
    if (clearTemporaryExercises) {
      clearTemporaryExercises();
    }
    if (clearCache) {
      clearCache();
    }

    // 3. Navigate with animation & refetch flags
    // Only animate XP if we actually gained XP (> 0)
    navigate("/home", {
      replace: true,
      state: {
        animateXP: xpGained > 0,
        shouldRefetchStreak: true
      }
    });
  };

  return {
    isSaving,
    handleSaveWorkout,
    // Summary Props
    showSummary,
    summaryStats,
    xpGained,
    finalDuration,
    handleCloseSummary
  };
}
