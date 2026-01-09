
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/userProfile';
import { calculateAge } from '@/utils/profileUtils';

export interface MacroRecommendations {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export const useMacroCalculations = () => {
  // Function to recalculate macros when relevant data changes
  const recalculateMacros = async (profileData: UserProfile): Promise<MacroRecommendations | null> => {
    console.log('Starting macro calculation with profile data:', profileData);

    // Check if we have the minimum required data
    if (!profileData.current_weight_kg || !profileData.height_cm) {
      console.log('Missing required data for macro calculation:', {
        weight: profileData.current_weight_kg,
        height: profileData.height_cm
      });
      return null;
    }

    // Default age to 30 if dob is missing
    const age = profileData.date_of_birth ? calculateAge(profileData.date_of_birth) : 30;

    try {
      // Provide safe defaults for potentially null values
      const safeGender = profileData.gender || 'male';
      const safeTrainings = profileData.trainings_per_week || 3;

      // Handle target_pace with safe defaults
      let dbTargetPace = 'moderate'; // default
      if (profileData.target_pace) {
        if (profileData.target_pace === 'sloth') dbTargetPace = 'slow';
        else if (profileData.target_pace === 'rabbit') dbTargetPace = 'moderate';
        else if (profileData.target_pace === 'leopard') dbTargetPace = 'fast';
      }

      // Handle main_goal with safe defaults
      let dbGoal = 'maintain_weight'; // default
      if (profileData.main_goal) {
        if (profileData.main_goal === 'lose_weight') dbGoal = 'lose_weight';
        else if (profileData.main_goal === 'gain_muscle') dbGoal = 'build_muscle';
        else if (profileData.main_goal === 'maintain_weight') dbGoal = 'maintain_weight';
        else if (profileData.main_goal === 'improve_health') dbGoal = 'improve_health';
        else if (profileData.main_goal === 'increase_strength') dbGoal = 'increase_strength';
      }

      console.log('Calling macro calculation with safe values:', {
        weight: profileData.current_weight_kg,
        height: profileData.height_cm,
        age,
        gender: safeGender,
        goal: dbGoal,
        trainings: safeTrainings,
        pace: dbTargetPace
      });

      const { data, error } = await supabase.rpc('calculate_macro_recommendations', {
        user_weight_kg: profileData.current_weight_kg,
        user_height_cm: profileData.height_cm,
        user_age: age,
        user_gender: safeGender,
        user_goal: dbGoal,
        user_trainings_per_week: safeTrainings,
        user_target_pace: dbTargetPace
      });

      if (error) {
        console.error('Error calculating macros:', error);
        return null;
      }

      console.log('Macro calculation result:', data);

      // Type assertion with proper conversion to handle Json type
      const macroData = data as unknown as MacroRecommendations;
      return macroData;
    } catch (error) {
      console.error('Error calling macro calculation function:', error);
      return null;
    }
  };

  return { recalculateMacros };
};
