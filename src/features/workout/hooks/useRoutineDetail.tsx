
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface ExerciseSet {
  set_number: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

export interface ExerciseDetail {
  id: number;
  name: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  reps_range?: string;
  rest_between_sets_seconds: number;
  muscle_group_main?: string;
  equipment_required?: string;
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  notes?: string;
}

export interface Routine {
  id: number;
  name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  type?: string;
}

export const fetchRoutineDetailsById = async (routineId: number) => {
  if (!routineId) throw new Error("No routine ID");

  console.log('🏃‍♂️ Fetching routine details for routineId:', routineId);

  // Fetch routine details
  const { data: routineData, error: routineError } = await supabase
    .from('routines')
    .select('*')
    .eq('id', routineId)
    .single();

  if (routineError) {
    console.error("❌ Error fetching routine:", routineError);
    throw routineError;
  }

  // Fetch exercises
  const { data: exercisesData, error: exercisesError } = await supabase
    .from('routine_exercises')
    .select(`
      id,
      sets,
      reps_min,
      reps_max,
      reps_range,
      rest_between_sets_seconds,
      exercise_id,
      exercise_order,
      notes,
      exercises!routine_exercises_exercise_id_fkey(
        name,
        muscle_group_main,
        equipment_required,
        image_url,
        video_url,
        thumbnail_url
      )
    `)
    .eq('routine_id', routineId)
    .order('exercise_order', { ascending: true });

  if (exercisesError) {
    console.error("❌ Error fetching exercises:", exercisesError);
    throw exercisesError;
  }

  const formattedExercises = (exercisesData || []).map(ex => ({
    id: ex.exercise_id,
    name: ex.exercises?.name || "Exercise name not found",
    sets: ex.sets || 0,
    reps_min: ex.reps_min || 0,
    reps_max: ex.reps_max || 0,
    reps_range: ex.reps_range,
    rest_between_sets_seconds: ex.rest_between_sets_seconds || 60,
    muscle_group_main: ex.exercises?.muscle_group_main,
    equipment_required: ex.exercises?.equipment_required,
    image_url: ex.exercises?.image_url,
    video_url: ex.exercises?.video_url,
    thumbnail_url: ex.exercises?.thumbnail_url,
    notes: ex.notes || ""
  }));

  return {
    routine: routineData as Routine,
    exercises: formattedExercises as ExerciseDetail[]
  };
};

export const useRoutineDetail = (routineId: number | undefined) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [startingWorkout, setStartingWorkout] = useState(false);

  const fetchRoutineDetailsWrapper = async () => {
    try {
      return await fetchRoutineDetailsById(routineId as number);
    } catch (error: any) {
      if (error?.code === 'PGRST116') {
        toast({
          title: "Rutina no encontrada",
          description: `La rutina con ID ${routineId} no existe en el sistema`,
          variant: "destructive"
        });
      }
      throw error;
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['routine', routineId],
    queryFn: fetchRoutineDetailsWrapper,
    enabled: !!routineId,
  });

  const routine = data?.routine || null;
  const exerciseDetails = data?.exercises || [];

  const handleStartWorkout = async () => {
    if (!routine) return;

    setStartingWorkout(true);

    try {
      console.log('🚀 Starting workout for routine:', routine.id);

      // Navigate to active workout page
      navigate(`/workout/active/${routine.id}`);

      toast({
        title: "¡Entrenamiento iniciado!",
        description: `Has comenzado la rutina ${routine.name}`,
        variant: "default"
      });
    } catch (error) {
      console.error("❌ Error starting workout:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el entrenamiento",
        variant: "destructive"
      });
    } finally {
      setStartingWorkout(false);
    }
  };

  return {
    routine,
    exerciseDetails,
    loading: isLoading,
    startingWorkout,
    handleStartWorkout
  };
};
