
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocalTimezone } from "./useLocalTimezone";

interface WorkoutSummary {
  id: number;
  name: string;
  duration: string;
  calories: number;
  date: string;
  exercises: string[];
  exerciseCount?: number;
  totalSets?: number;
}

interface MacroData {
  calories: { current: number; target: number; unit: string };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
}

export const useHomePageData = () => {
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasCompletedWorkout, setHasCompletedWorkout] = useState(false);
  const [workoutSummaries, setWorkoutSummaries] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [datesWithWorkouts, setDatesWithWorkouts] = useState<Date[]>([]);
  const { getLocalDateString, getLocalDayRange } = useLocalTimezone();

  // Stable initial macros to prevent re-renders
  const initialMacros = useMemo(() => ({
    calories: {
      current: 0,
      target: profile?.initial_recommended_calories || 2000,
      unit: "kcal" as const
    },
    protein: {
      current: 0,
      target: profile?.initial_recommended_protein_g || 120
    },
    carbs: {
      current: 0,
      target: profile?.initial_recommended_carbs_g || 200
    },
    fats: {
      current: 0,
      target: profile?.initial_recommended_fats_g || 65
    }
  }), [
    profile?.initial_recommended_calories,
    profile?.initial_recommended_protein_g,
    profile?.initial_recommended_carbs_g,
    profile?.initial_recommended_fats_g
  ]);

  const [macros, setMacros] = useState<MacroData>(initialMacros);

  // Update macro targets when profile changes
  useEffect(() => {
    if (profile) {
      setMacros(prev => ({
        calories: {
          current: prev.calories.current,
          target: profile.initial_recommended_calories || 2000,
          unit: "kcal"
        },
        protein: {
          current: prev.protein.current,
          target: profile.initial_recommended_protein_g || 120
        },
        carbs: {
          current: prev.carbs.current,
          target: profile.initial_recommended_carbs_g || 200
        },
        fats: {
          current: prev.fats.current,
          target: profile.initial_recommended_fats_g || 65
        }
      }));
    }
  }, [profile]);

  // Memoize the selected date string
  const selectedDateString = useMemo(() =>
    getLocalDateString(selectedDate), [selectedDate, getLocalDateString]
  );

  // Memoize day range
  const dayRange = useMemo(() =>
    getLocalDayRange(selectedDate), [selectedDate, getLocalDayRange]
  );

  // Consolidated fetch function
  const fetchAllHomeData = useCallback(async (isInitialLoad = false) => {
    if (!user?.id) return;

    if (isInitialLoad) setLoading(true);

    try {
      // Execute all major queries in parallel
      const [foodRes, workoutRes, datesRes] = await Promise.all([
        supabase
          .from('daily_food_log_entries')
          .select('calories_consumed, protein_g_consumed, carbs_g_consumed, fat_g_consumed')
          .eq('user_id', user.id)
          .eq('log_date', selectedDateString),

        supabase
          .from('workout_logs')
          .select(`
            id,
            routine_name_snapshot,
            duration_completed_minutes,
            calories_burned_estimated,
            workout_date,
            workout_log_exercise_details(exercise_name_snapshot)
          `)
          .eq('user_id', user.id)
          .gte('workout_date', dayRange.startOfDay)
          .lte('workout_date', dayRange.endOfDay)
          .order('workout_date', { ascending: false }),

        isInitialLoad || datesWithWorkouts.length === 0 ?
          supabase
            .from('workout_logs')
            .select('workout_date')
            .eq('user_id', user.id)
            .order('workout_date', { ascending: false })
            .limit(50)
          : Promise.resolve({ data: null, error: null })
      ]);

      // 1. Process Food / Macros
      if (foodRes.data) {
        const totals = foodRes.data.reduce(
          (sum, entry) => ({
            calories: sum.calories + (entry.calories_consumed || 0),
            protein: sum.protein + (entry.protein_g_consumed || 0),
            carbs: sum.carbs + (entry.carbs_g_consumed || 0),
            fats: sum.fats + (entry.fat_g_consumed || 0)
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        setMacros(prev => ({
          ...prev,
          calories: { ...prev.calories, current: Math.round(totals.calories) },
          protein: { ...prev.protein, current: Math.round(totals.protein) },
          carbs: { ...prev.carbs, current: Math.round(totals.carbs) },
          fats: { ...prev.fats, current: Math.round(totals.fats) }
        }));
      }

      // 2. Process Workouts
      if (workoutRes.data && workoutRes.data.length > 0) {
        const workouts = workoutRes.data.map(workout => {
          const exerciseNames = Array.from(
            new Set(
              workout.workout_log_exercise_details.map((detail: any) => detail.exercise_name_snapshot)
            )
          );

          let duration = workout.duration_completed_minutes || Math.max(15, exerciseNames.length * 3);
          let calories = workout.calories_burned_estimated || Math.round(duration * 6);

          return {
            id: workout.id,
            name: workout.routine_name_snapshot || "Entrenamiento",
            duration: `${duration} min`,
            calories: calories,
            date: workout.workout_date,
            exercises: exerciseNames.slice(0, 3),
            exerciseCount: exerciseNames.length,
            totalSets: workout.workout_log_exercise_details.length
          };
        });

        setWorkoutSummaries(workouts);
        setHasCompletedWorkout(true);
      } else {
        setWorkoutSummaries([]);
        setHasCompletedWorkout(false);
      }

      // 3. Process Workout Dates (only if fetched)
      if (datesRes.data && datesRes.data.length > 0) {
        const dates = datesRes.data.map(item => {
          const serverDate = new Date(item.workout_date);
          return new Date(serverDate.getTime() + (serverDate.getTimezoneOffset() * 60000));
        });
        setDatesWithWorkouts(dates);
      }

    } catch (error) {
      console.error("Error loading home page data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedDateString, dayRange.startOfDay, dayRange.endOfDay, datesWithWorkouts.length]);

  // Initial load and whenever critical params change
  useEffect(() => {
    fetchAllHomeData(true);
  }, [user?.id, selectedDateString]); // Consolidated effect

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return {
    selectedDate,
    hasCompletedWorkout,
    workoutSummaries,
    loading,
    datesWithWorkouts,
    macros,
    handleDateSelect,
    refetch: fetchAllHomeData
  };
};
