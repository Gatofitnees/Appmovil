
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { convertRoutineTypeToUi } from "@/features/workout/utils/routineTypeMapping";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  estimated_duration_minutes?: number;
  exercise_count?: number;
  created_at: string;
  is_predefined?: boolean;
  source_type?: 'created' | 'downloaded' | 'gatofit_program';
  muscles?: string[];
}

import { useQuery } from '@tanstack/react-query';

export const useRoutines = () => {
  const { toast } = useToast();

  const fetchRoutines = async () => {
    console.log("Fetching routines (SWR)...");
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('routines')
      .select(`
        *,
        routine_exercises!routine_exercises_routine_id_fkey(
          exercise:exercise_id(
            muscle_group_main
          )
        )
      `)
      .eq('is_predefined', false)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching routines:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutinas",
        variant: "destructive"
      });
      throw error;
    }

    if (!data) return [];

    return data.map(routine => {
      const isDownloaded = routine.name.includes('(Copia)');
      const isFromGatofitProgram = routine.name.includes('(Programa Gatofit)');

      let sourceType: 'created' | 'downloaded' | 'gatofit_program' = 'created';
      if (isFromGatofitProgram) sourceType = 'gatofit_program';
      else if (isDownloaded) sourceType = 'downloaded';

      let exerciseCount = 0;
      const muscles = new Set<string>();

      if (routine.routine_exercises) {
        exerciseCount = routine.routine_exercises.length;
        routine.routine_exercises.forEach((re: any) => {
          if (re.exercise?.muscle_group_main) {
            re.exercise.muscle_group_main.split(/[,\s]+/).forEach((muscle: string) => {
              if (muscle.trim()) {
                muscles.add(muscle.trim().charAt(0).toUpperCase() + muscle.trim().slice(1));
              }
            });
          }
        });
      }

      return {
        ...routine,
        type: routine.type ? convertRoutineTypeToUi(routine.type) : 'General',
        exercise_count: exerciseCount,
        source_type: sourceType,
        muscles: Array.from(muscles)
      } as WorkoutRoutine;
    });
  };

  const { data: routines = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['my_routines'],
    queryFn: fetchRoutines,
  });

  return {
    routines,
    // `isLoading` is only true on first *hard* load without cache.
    // If cache exists, `isLoading` is false, and `isFetching` handles background syncs.
    loading: isLoading,
    isFetching,
    refetch
  };
};
