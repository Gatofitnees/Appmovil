import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCoachAssignment = () => {
  const { user } = useAuth();
  const [coachId, setCoachId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachAssignment = async () => {
      try {
        if (!user) {
          setCoachId(null);
          setLoading(false);
          return;
        }

        const { data: assignment } = await supabase
          .from('coach_user_assignments')
          .select('coach_id')
          .eq('user_id', user.id)
          .single();

        setCoachId(assignment?.coach_id || null);
      } catch (error) {
        console.error('Error fetching coach assignment:', error);
        setCoachId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachAssignment();
  }, [user]);

  return { coachId, loading };
};
