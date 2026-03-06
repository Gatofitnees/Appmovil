import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UserProfile } from '@/types/userProfile';
import { convertDatabaseToProfile, convertProfileToDatabase } from '@/utils/profileUtils';
import { useMacroCalculations } from '@/hooks/useMacroCalculations';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { recalculateMacros } = useMacroCalculations();
  const queryClient = useQueryClient();

  // Get current user from Supabase directly (fallback for timing issues)
  const getCurrentUser = async (): Promise<any> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session from Supabase:', error);
        return null;
      }

      if (session?.user) {
        return session.user;
      }

      if (user) {
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  };

  const fetchProfile = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No user found");

    console.log("Fetching profile from Supabase for", currentUser.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return convertDatabaseToProfile(data);
  };

  const { data: profile = null, isLoading: loading, refetch } = useQuery({
    queryKey: ['user_profile', user?.id],
    queryFn: fetchProfile,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutos de staleTime para no re-peticionar constantemente
  });

  const updateProfile = async (updates: Partial<UserProfile>, retryCount = 0): Promise<boolean> => {
    const maxRetries = 3;

    let currentUser = await getCurrentUser();

    if (!currentUser) {
      console.error('No user found for profile update');
      if (retryCount < maxRetries) {
        console.log(`Retrying profile update (attempt ${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return updateProfile(updates, retryCount + 1);
      }
      return false;
    }

    console.log('Updating profile with:', updates);

    try {
      const dbUpdates = convertProfileToDatabase(updates);

      // First, update the basic profile data
      const { error: updateError } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      // Check if we need to recalculate macros
      const shouldRecalculateMacros = [
        'current_weight_kg', 'height_cm', 'date_of_birth', 'gender',
        'main_goal', 'trainings_per_week', 'target_pace'
      ].some(field => field in dbUpdates);

      let macroUpdates: any = {};

      if (shouldRecalculateMacros && profile) {
        const updatedProfile = { ...profile, ...updates };
        const newMacros = await recalculateMacros(updatedProfile);

        if (newMacros) {
          macroUpdates = {
            initial_recommended_calories: newMacros.calories,
            initial_recommended_protein_g: newMacros.protein_g,
            initial_recommended_carbs_g: newMacros.carbs_g,
            initial_recommended_fats_g: newMacros.fats_g
          };

          const { error: macroError } = await supabase
            .from('profiles')
            .update(macroUpdates)
            .eq('id', currentUser.id);

          if (macroError) {
            console.error('Error updating macros:', macroError);
          }
        }
      }

      // Optimistic update del caché de React Query
      queryClient.setQueryData(['user_profile', currentUser.id], (oldProfile: any) => {
        if (!oldProfile) return null;
        return {
          ...oldProfile,
          ...updates,
          ...(macroUpdates.initial_recommended_calories && {
            initial_recommended_calories: macroUpdates.initial_recommended_calories,
            initial_recommended_protein_g: macroUpdates.initial_recommended_protein_g,
            initial_recommended_carbs_g: macroUpdates.initial_recommended_carbs_g,
            initial_recommended_fats_g: macroUpdates.initial_recommended_fats_g
          })
        };
      });

      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);

      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return updateProfile(updates, retryCount + 1);
      }

      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive"
      });
      return false;
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username) return false;

    try {
      const currentUser = await getCurrentUser();
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .neq('id', currentUser?.id || '');

      if (error) throw error;
      return data.length === 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    checkUsernameAvailability,
    refetch
  };
};
