
import { supabase } from '@/integrations/supabase/client';

export const useFoodLogProfile = () => {
  const ensureUserProfile = async (userId: string) => {
    try {
      console.log('Checking if user profile exists for:', userId);

      // Check if profile exists using maybeSingle to avoid errors when no data is found
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile:', checkError);
        throw checkError;
      }

      if (!existingProfile) {
        console.log('Creating profile for user:', userId);

        // Create profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }

        console.log('Profile created successfully for user:', userId);
      } else {
        console.log('Profile already exists for user:', userId);
      }
    } catch (err) {
      console.error('Error ensuring user profile:', err);
      throw err;
    }
  };

  const updateUserStreak = async (date?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc('update_user_streak_v2', {
        p_user_id: user.id,
        p_client_date: date
      });

      if (error) {
        console.error('Error calling update_user_streak_v2:', error);
        throw error;
      }

    } catch (err) {
      console.error('Error updating user streak:', err);
    }
  };

  return {
    ensureUserProfile,
    updateUserStreak
  };
};
