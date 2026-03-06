import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export const useCoachAssignment = () => {
  const { user } = useAuth();

  const fetchCoachAssignment = async (): Promise<string | null> => {
    if (!user) return null;

    const { data: assignment, error } = await supabase
      .from('coach_user_assignments')
      .select('coach_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching coach assignment:', error);
      return null;
    }

    return assignment?.coach_id || null;
  };

  const { data: coachId = null, isLoading: loading } = useQuery({
    queryKey: ['coach_assignment', user?.id],
    queryFn: fetchCoachAssignment,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  return { coachId, loading };
};
