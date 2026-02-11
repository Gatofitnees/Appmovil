import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileContext } from '@/contexts/ProfileContext';
import { useHomePageData } from '@/hooks/useHomePageData';
import { useRoutines } from '@/hooks/useRoutines';
import { useFoodLog } from '@/hooks/useFoodLog';
import { UserData, ChatMessage } from './types';

export const useDataCollection = () => {
  const { user } = useAuth();
  const { profile } = useProfileContext();
  const { macros } = useHomePageData();
  const { routines } = useRoutines();
  const { entries } = useFoodLog();
  const [coachCompanyName, setCoachCompanyName] = useState<string>('gatofit');

  useEffect(() => {
    const fetchCoachCompany = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('coach_user_assignments')
          .select(`
            coach_id,
            coach:coach_branding_public(company_name)
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && data.coach) {
          // Supabase returns an array or object depending on relationship, handle typings safely if needed
          // Assuming branding is 1:1 with coach profile which is 1:1 with coach_id
          const branding = data.coach as any;
          if (branding && branding.company_name) {
            setCoachCompanyName(branding.company_name);
          }
        }
      } catch (error) {
        console.error('Error fetching coach company:', error);
      }
    };

    fetchCoachCompany();
  }, [user]);

  const collectUserData = (messages: ChatMessage[]): UserData => {
    // Filter today's food entries
    const todayEntries = entries.filter(entry => {
      const today = new Date().toISOString().split('T')[0];
      const entryDate = new Date(entry.log_date).toISOString().split('T')[0];
      return entryDate === today;
    });

    // Calculate age from date of birth
    const getAge = () => {
      if (!profile?.date_of_birth) return null;
      const today = new Date();
      const birthDate = new Date(profile.date_of_birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    return {
      user: {
        id: user?.id,
        email: user?.email,
        name: profile?.full_name || profile?.username,
        coach_company: coachCompanyName,
      },
      profile: {
        weight_kg: profile?.current_weight_kg,
        height_cm: profile?.height_cm,
        age: getAge(),
        gender: profile?.gender,
        body_fat_percentage: profile?.body_fat_percentage,
        main_goal: profile?.main_goal,
        target_weight_kg: profile?.target_weight_kg,
        target_pace: profile?.target_pace,
        target_kg_per_week: profile?.target_kg_per_week,
        trainings_per_week: profile?.trainings_per_week,
        previous_app_experience: profile?.previous_app_experience ? 'yes' : 'no',
      },
      nutrition: {
        daily_targets: {
          calories: macros.calories.target,
          protein_g: macros.protein.target,
          carbs_g: macros.carbs.target,
          fats_g: macros.fats.target,
        },
        today_consumed: {
          calories: macros.calories.current,
          protein_g: macros.protein.current,
          carbs_g: macros.carbs.current,
          fats_g: macros.fats.current,
        },
        food_entries_today: todayEntries?.map(entry => ({
          food_name: entry.custom_food_name,
          portion_size: entry.quantity_consumed,
          calories: entry.calories_consumed,
          protein_g: entry.protein_g_consumed,
          carbs_g: entry.carbs_g_consumed,
          fat_g: entry.fat_g_consumed,
          meal_type: entry.meal_type,
        })) || [],
      },
      routines: routines.map(routine => ({
        id: routine.id.toString(), // Convert number to string
        name: routine.name,
        type: routine.type,
        description: routine.description,
        estimated_duration_minutes: routine.estimated_duration_minutes,
        exercise_count: routine.exercise_count,
      })),
      chat_history: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };
  };

  return { collectUserData };
};
