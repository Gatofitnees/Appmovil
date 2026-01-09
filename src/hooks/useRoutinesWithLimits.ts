import { useState, useCallback } from 'react';
import { useRoutines } from '@/hooks/useRoutines';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRoutinesWithLimits = () => {
  const { user } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const routinesHook = useRoutines();
  const { isPremium, isAsesorado } = useSubscription();
  const { incrementUsage, checkRoutineLimit, showLimitReachedToast } = useUsageLimits();
  const { toast } = useToast();

  const createRoutine = useCallback(async (routineData: any) => {
    const limitCheck = await checkRoutineLimit(isPremium);

    if (!limitCheck.canProceed) {
      showLimitReachedToast('routines');
      setShowPremiumModal(true);
      return null;
    }

    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('routines')
        .insert({
          ...routineData,
          user_id: user.id,
          is_predefined: false
        })
        .select()
        .single();

      if (error) throw error;

      if (data && !isPremium) {
        await incrementUsage('routines');
      }

      await routinesHook.refetch();

      return data;
    } catch (error) {
      console.error('Error creating routine:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la rutina",
        variant: "destructive"
      });
      return null;
    }
  }, [checkRoutineLimit, isPremium, showLimitReachedToast, incrementUsage, routinesHook.refetch, toast, user]);

  const deleteRoutine = useCallback(async (routineId: number) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { data: routine, error: fetchError } = await supabase
        .from('routines')
        .select('user_id, is_predefined')
        .eq('id', routineId)
        .single();

      if (fetchError) throw fetchError;

      if (routine.user_id !== user.id) {
        throw new Error('No tienes permisos para eliminar esta rutina');
      }

      const { error: deleteError } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId);

      if (deleteError) throw deleteError;

      if (!routine.is_predefined && !isPremium) {
        await decrementUsage('routines');
      }

      await routinesHook.refetch();

      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error deleting routine:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la rutina",
        variant: "destructive"
      });
      return false;
    }
  }, [isPremium, routinesHook.refetch, toast, user]);

  const decrementUsage = useCallback(async (type: 'routines') => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase.rpc('increment_usage_counter', {
        p_user_id: user.id,
        counter_type: type,
        increment_by: -1
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error decrementing usage:', error);
      return false;
    }
  }, [user]);

  const getRoutineUsageInfo = useCallback(async () => {
    const limitCheck = await checkRoutineLimit(isPremium);
    return {
      current: limitCheck.currentUsage,
      limit: limitCheck.limit,
      canCreate: limitCheck.canProceed,
      isOverLimit: limitCheck.isOverLimit
    };
  }, [checkRoutineLimit, isPremium]);

  return {
    ...routinesHook,
    createRoutine,
    deleteRoutine,
    getRoutineUsageInfo,
    showPremiumModal,
    setShowPremiumModal,
    isPremium,
    isAsesorado
  };
};
