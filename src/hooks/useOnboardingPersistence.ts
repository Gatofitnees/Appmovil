
import { useState, useEffect } from 'react';
import { OnboardingData } from '@/pages/onboarding/OnboardingFlow';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_STORAGE_KEY = 'gatofit_onboarding_data';
const GOOGLE_AUTH_PENDING_KEY = 'gatofit_google_auth_pending';

export const useOnboardingPersistence = () => {
  const { user, loading: authLoading } = useAuth();
  const { updateProfile } = useProfile();

  const loadOnboardingData = (): OnboardingData | null => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      return null;
    }
  };

  const saveOnboardingData = (data: OnboardingData) => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
      console.log('Onboarding data saved to localStorage:', data);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const markGoogleAuthPending = (data: OnboardingData) => {
    try {
      localStorage.setItem(GOOGLE_AUTH_PENDING_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      console.log('Google auth pending data saved:', data);
    } catch (error) {
      console.error('Error saving Google auth pending data:', error);
    }
  };

  const getGoogleAuthPendingData = (): OnboardingData | null => {
    try {
      const stored = localStorage.getItem(GOOGLE_AUTH_PENDING_KEY);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      // Check if data is less than 30 minutes old
      if (Date.now() - parsed.timestamp > 30 * 60 * 1000) {
        localStorage.removeItem(GOOGLE_AUTH_PENDING_KEY);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('Error loading Google auth pending data:', error);
      return null;
    }
  };

  const clearGoogleAuthPending = () => {
    try {
      localStorage.removeItem(GOOGLE_AUTH_PENDING_KEY);
      console.log('Google auth pending data cleared');
    } catch (error) {
      console.error('Error clearing Google auth pending data:', error);
    }
  };

  const clearOnboardingData = () => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      localStorage.removeItem(GOOGLE_AUTH_PENDING_KEY);
      console.log('All onboarding data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
    }
  };

  const getCurrentUser = async (): Promise<any> => {
    try {
      // Get fresh session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session from Supabase:', error);
        return null;
      }

      if (session?.user) {
        console.log('Got user from fresh session:', session.user.id);
        return session.user;
      }

      // Fallback to context user
      if (user) {
        console.log('Using user from context:', user.id);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  };

  const validateUserForSaving = async (): Promise<{ isValid: boolean; user: any }> => {
    console.log('Validating user for saving...');
    
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      console.log('No user found for validation');
      return { isValid: false, user: null };
    }
    
    if (!currentUser.id) {
      console.error('User ID is missing, cannot save onboarding data');
      return { isValid: false, user: null };
    }
    
    console.log('User validation successful:', currentUser.id);
    return { isValid: true, user: currentUser };
  };

  const checkIfUserHasCompleteProfile = async (): Promise<boolean> => {
    console.log('Checking if user has complete profile...');
    
    const validationResult = await validateUserForSaving();
    if (!validationResult.isValid) {
      console.log('User not authenticated, considering profile incomplete');
      return false;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('gender, date_of_birth, main_goal, height_cm, current_weight_kg')
        .eq('id', validationResult.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return false;
      }

      // Check if critical fields are filled
      const hasCompleteProfile = !!(
        profile?.gender &&
        profile?.date_of_birth &&
        profile?.main_goal &&
        profile?.height_cm &&
        profile?.current_weight_kg
      );

      console.log('Profile completeness check:', {
        hasCompleteProfile,
        profileData: profile
      });

      return hasCompleteProfile;
    } catch (error) {
      console.error('Error checking profile completeness:', error);
      return false;
    }
  };

  const saveOnboardingToProfile = async (data: OnboardingData, skipRetries: boolean = false, preserveExisting: boolean = false): Promise<boolean> => {
    console.log('Starting to save onboarding data to profile:', data);
    console.log('Preserve existing data:', preserveExisting);
    
    // Check for Google auth pending data first
    const pendingData = getGoogleAuthPendingData();
    const dataToSave = pendingData || data;
    
    console.log('Data to save (with pending check):', dataToSave);
    
    // Wait for user with retry logic
    let retryCount = 0;
    const maxRetries = skipRetries ? 1 : 5;
    let validationResult = { isValid: false, user: null };

    while (retryCount < maxRetries && !validationResult.isValid) {
      console.log(`Validation attempt ${retryCount + 1}/${maxRetries}`);
      validationResult = await validateUserForSaving();
      
      if (!validationResult.isValid) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Waiting ${1000 * retryCount}ms before retry ${retryCount + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    if (!validationResult.isValid) {
      console.error(`Failed to validate user after ${maxRetries} attempts`);
      return false;
    }

    const authenticatedUser = validationResult.user;

    try {
      console.log('User validated, proceeding with profile update:', authenticatedUser.id);

      const convertMainGoal = (goal: string | null) => {
        if (!goal) return null;
        const goalMap: { [key: string]: string } = {
          'gain_muscle': 'gain_muscle',
          'lose_weight': 'lose_weight',
          'maintain_weight': 'maintain_weight',
          'improve_health': 'improve_health',
          'increase_strength': 'increase_strength'
        };
        return goalMap[goal] || goal;
      };

      // Prepare profile updates with better validation
      const profileUpdates: any = {
        email: authenticatedUser.email || null, // Add email from authenticated user
        gender: dataToSave.gender as 'male' | 'female' | null,
        height_cm: dataToSave.height || null,
        current_weight_kg: dataToSave.weight || null,
        body_fat_percentage: dataToSave.bodyFatPercentage || null,
        date_of_birth: typeof dataToSave.dateOfBirth === 'string' ? dataToSave.dateOfBirth : dataToSave.dateOfBirth?.toISOString().split('T')[0] || null,
        trainings_per_week: dataToSave.trainingsPerWeek || null,
        previous_app_experience: dataToSave.previousAppExperience !== undefined ? dataToSave.previousAppExperience : null,
        main_goal: convertMainGoal(dataToSave.mainGoal) as 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle' | 'improve_health' | 'increase_strength' | null,
        target_weight_kg: dataToSave.targetWeight || null,
        target_pace: dataToSave.targetPace as 'sloth' | 'rabbit' | 'leopard' | null,
        target_kg_per_week: dataToSave.targetKgPerWeek || null,
        diet_id: dataToSave.diet || null,
        initial_recommended_calories: dataToSave.initial_recommended_calories || null,
        initial_recommended_protein_g: dataToSave.initial_recommended_protein_g || null,
        initial_recommended_carbs_g: dataToSave.initial_recommended_carbs_g || null,
        initial_recommended_fats_g: dataToSave.initial_recommended_fats_g || null,
        unit_system_preference: dataToSave.unit_system_preference as 'metric' | 'imperial' | null
      };

      // If preserveExisting is true, filter out null/undefined values to avoid overwriting existing data
      if (preserveExisting) {
        console.log('Filtering null values to preserve existing data...');
        const filteredUpdates: any = {};
        Object.keys(profileUpdates).forEach(key => {
          if (profileUpdates[key] !== null && profileUpdates[key] !== undefined) {
            filteredUpdates[key] = profileUpdates[key];
          }
        });
        
        // Only proceed if there's actually data to update
        if (Object.keys(filteredUpdates).length === 0) {
          console.log('No non-null data to update, skipping profile update');
          return true;
        }
        
        console.log('Filtered profile updates:', filteredUpdates);
        
        const success = await updateProfile(filteredUpdates);
        
        if (success) {
          console.log('Onboarding data successfully saved to profile (preserved existing)');
          return true;
        } else {
          console.error('Failed to save onboarding data to profile - updateProfile returned false');
          return false;
        }
      } else {
        console.log('Profile updates to be saved (full update):', profileUpdates);

        const success = await updateProfile(profileUpdates);
        
        if (success) {
          console.log('Onboarding data successfully saved to profile');
          // Clear all onboarding data after successful save
          clearOnboardingData();
          return true;
        } else {
          console.error('Failed to save onboarding data to profile - updateProfile returned false');
          return false;
        }
      }
      
    } catch (error) {
      console.error('Error saving onboarding data to profile:', error);
      return false;
    }
  };

  const waitForUserAuthentication = async (maxWaitTime = 15000): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const validationResult = await validateUserForSaving();
      if (validationResult.isValid) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return false;
  };

  const handleGoogleAuthData = async (): Promise<boolean> => {
    console.log('Handling Google auth data...');
    
    // Check if there's pending Google auth data
    const pendingData = getGoogleAuthPendingData();
    if (!pendingData) {
      console.log('No pending Google auth data found');
      return false;
    }
    
    console.log('Found pending Google auth data:', pendingData);
    
    // Wait for authentication to complete
    const authSuccess = await waitForUserAuthentication();
    if (!authSuccess) {
      console.error('Google authentication did not complete in time');
      return false;
    }
    
    // Save the pending data
    const saveSuccess = await saveOnboardingToProfile(pendingData, true);
    if (saveSuccess) {
      console.log('Successfully saved Google auth pending data');
      clearGoogleAuthPending();
      return true;
    }
    
    console.error('Failed to save Google auth pending data');
    return false;
  };

  return {
    loadOnboardingData,
    saveOnboardingData,
    clearOnboardingData,
    saveOnboardingToProfile,
    waitForUserAuthentication,
    validateUserForSaving,
    checkIfUserHasCompleteProfile,
    markGoogleAuthPending,
    getGoogleAuthPendingData,
    clearGoogleAuthPending,
    handleGoogleAuthData
  };
};
