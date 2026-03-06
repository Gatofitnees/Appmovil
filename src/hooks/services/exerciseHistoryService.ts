
import { supabase } from "@/integrations/supabase/client";

export const fetchExerciseHistory = async (exerciseId: number) => {
  console.log('Fetching exercise history for exerciseId:', exerciseId);

  const { data, error } = await supabase
    .from('workout_log_exercise_details')
    .select(`
      id,
      exercise_id,
      weight_kg_used,
      reps_completed,
      rir,
      partial_reps,
      set_number,
      workout_log_id,
      workout_log:workout_logs!workout_log_exercise_details_workout_log_id_fkey(workout_date, user_id)
    `)
    .eq('exercise_id', exerciseId)
    .order('workout_log_id', { ascending: false });

  if (error) throw error;

  console.log('Raw data from database:', data);
  return data;
};
