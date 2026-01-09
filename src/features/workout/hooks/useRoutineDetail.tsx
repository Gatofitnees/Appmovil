
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ExerciseSet {
  set_number: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
}

interface ExerciseDetail {
  id: number;
  name: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  reps_range?: string;
  rest_between_sets_seconds: number;
  muscle_group_main?: string;
  equipment_required?: string;
  notes?: string;
}

interface Routine {
  id: number;
  name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  type?: string;
}

export const useRoutineDetail = (routineId: number | undefined) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingWorkout, setStartingWorkout] = useState(false);

  useEffect(() => {
    if (!routineId) {
      setLoading(false);
      return;
    }

    const fetchRoutineDetails = async () => {
      try {
        console.log('🏃‍♂️ Fetching routine details for routineId:', routineId);

        // Fetch routine details
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', routineId)
          .single();

        if (routineError) {
          console.error("❌ Error fetching routine:", routineError);
          if (routineError.code === 'PGRST116') {
            // No rows returned - routine doesn't exist
            toast({
              title: "Rutina no encontrada",
              description: `La rutina con ID ${routineId} no existe en el sistema`,
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          throw routineError;
        }

        console.log('✅ Routine data fetched:', routineData);
        setRoutine(routineData);

        // Fetch exercises for this routine with correct ordering
        console.log('🏋️‍♀️ Fetching exercises for routine:', routineId);
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
              equipment_required
            )
          `)
          .eq('routine_id', routineId)
          .order('exercise_order', { ascending: true });

        if (exercisesError) {
          console.error("❌ Error fetching exercises:", exercisesError);
          console.error("❌ Error details:", {
            message: exercisesError.message,
            details: exercisesError.details,
            hint: exercisesError.hint,
            code: exercisesError.code
          });
          throw exercisesError;
        }

        console.log('🏋️‍♀️ Raw exercises data fetched:', exercisesData);
        console.log('🏋️‍♀️ Number of exercises found:', exercisesData?.length || 0);

        if (exercisesData) {
          // Transform to expected format
          const formattedExercises = exercisesData.map(ex => {
            const formatted = {
              id: ex.exercise_id,
              name: ex.exercises?.name || "Exercise name not found",
              sets: ex.sets || 0,
              reps_min: ex.reps_min || 0,
              reps_max: ex.reps_max || 0,
              reps_range: ex.reps_range,
              rest_between_sets_seconds: ex.rest_between_sets_seconds || 60,
              muscle_group_main: ex.exercises?.muscle_group_main,
              equipment_required: ex.exercises?.equipment_required,
              notes: ex.notes || ""
            };

            console.log('🔄 Formatted exercise:', formatted);
            return formatted;
          });

          console.log('✅ Final formatted exercises:', formattedExercises);
          setExerciseDetails(formattedExercises);
        } else {
          console.log('⚠️ No exercises data returned');
          setExerciseDetails([]);
        }
      } catch (error) {
        console.error("❌ Error loading routine details:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar los detalles de la rutina",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoutineDetails();
  }, [routineId, toast]);

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
    loading,
    startingWorkout,
    handleStartWorkout
  };
};
