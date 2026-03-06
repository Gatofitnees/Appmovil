
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocalTimezone } from "./useLocalTimezone";
import { useQuery } from "@tanstack/react-query";

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

  const fetchAllHomeData = async () => {
    if (!user?.id) throw new Error("No user");

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

      supabase
        .from('workout_logs')
        .select('workout_date')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(50)
    ]);

    let finalMacros = { ...macros };
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

      finalMacros = {
        ...macros,
        calories: { ...macros.calories, current: Math.round(totals.calories) },
        protein: { ...macros.protein, current: Math.round(totals.protein) },
        carbs: { ...macros.carbs, current: Math.round(totals.carbs) },
        fats: { ...macros.fats, current: Math.round(totals.fats) }
      };
    }

    let formattedWorkouts: WorkoutSummary[] = [];
    let completed = false;

    if (workoutRes.data && workoutRes.data.length > 0) {
      formattedWorkouts = workoutRes.data.map(workout => {
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
      completed = true;
    }

    let dates: Date[] = [];
    if (datesRes.data && datesRes.data.length > 0) {
      dates = datesRes.data.map(item => {
        const serverDate = new Date(item.workout_date);
        return new Date(serverDate.getTime() + (serverDate.getTimezoneOffset() * 60000));
      });
    }

    return {
      macros: finalMacros,
      workouts: formattedWorkouts,
      completed,
      dates
    };
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['home_data', user?.id, selectedDateString],
    queryFn: fetchAllHomeData,
    enabled: !!user?.id,
  });

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  return {
    selectedDate,
    hasCompletedWorkout: data?.completed || false,
    workoutSummaries: data?.workouts || [],
    loading: isLoading,
    datesWithWorkouts: data?.dates || [],
    macros: data?.macros || macros,
    handleDateSelect,
    refetch
  };
};
