import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export const useWeeklyStreakProgress = () => {
    const { user } = useAuth();
    const [completedDays, setCompletedDays] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchWeeklyProgress = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
        const end = endOfWeek(now, { weekStartsOn: 1 });

        try {
            const [workoutRes, foodRes] = await Promise.all([
                supabase
                    .from('workout_logs')
                    .select('workout_date')
                    .eq('user_id', user.id)
                    .gte('workout_date', start.toISOString())
                    .lte('workout_date', end.toISOString()),
                supabase
                    .from('daily_food_log_entries')
                    .select('log_date')
                    .eq('user_id', user.id)
                    .gte('log_date', format(start, 'yyyy-MM-dd'))
                    .lte('log_date', format(end, 'yyyy-MM-dd'))
            ]);

            const days = new Set<number>();

            if (workoutRes.data) {
                workoutRes.data.forEach(log => {
                    days.add(new Date(log.workout_date).getDay());
                });
            }

            if (foodRes.data) {
                foodRes.data.forEach(log => {
                    const [y, m, d] = log.log_date.split('-').map(Number);
                    const date = new Date(y, m - 1, d);
                    days.add(date.getDay());
                });
            }

            setCompletedDays([...days]);
        } catch (e) {
            console.error("Error fetching weekly progress for streak:", e);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWeeklyProgress();
    }, [fetchWeeklyProgress]);

    return {
        completedDays,
        isLoading,
        refetch: fetchWeeklyProgress
    };
};
