import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStreak {
    id: number;
    user_id: string;
    current_streak: number;
    last_activity_date: string | null;
    total_points: number;
    total_experience: number;
    current_level: number;
    experience_today: number;
    workouts_today: number;
    foods_today: number;
    last_xp_date: string | null;
    created_at: string;
    updated_at: string;
    streak_freezes: number;
    max_freezes_capacity: number;
    last_freeze_date: string | null;
    weekly_activity?: number[];
}

interface StreakContextType {
    streakData: UserStreak | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updateStreak: () => Promise<void>;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const StreakProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [streakData, setStreakData] = useState<UserStreak | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStreakData = useCallback(async () => {
        try {
            if (!user) {
                setStreakData(null);
                return;
            }

            setIsLoading(true);
            const { data, error } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            setStreakData(data);
        } catch (err) {
            setError('Error al cargar datos de racha');
            console.error('Error fetching streak data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const updateStreak = async () => {
        try {
            if (!user) return;

            // Call the database function to update streak
            const { error } = await supabase.rpc('update_user_streak_v2', {
                p_user_id: user.id
            });

            if (error) throw error;

            // Refresh streak data
            await fetchStreakData();
        } catch (err) {
            console.error('Error updating streak:', err);
        }
    };

    const cleanOldEntries = useCallback(async () => {
        try {
            const { error } = await supabase.rpc('clean_old_food_entries');
            if (error) throw error;
        } catch (err) {
            console.error('Error cleaning old entries:', err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchStreakData();
            cleanOldEntries();

            const channel = supabase
                .channel(`user_streaks_${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'user_streaks',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log('Streak updated via Realtime:', payload);
                        fetchStreakData();
                    }
                )
                .subscribe();

            // Add visibility change listener to refetch when app comes to foreground
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    console.log('App active, refreshing streak data...');
                    fetchStreakData();
                }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                supabase.removeChannel(channel);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        } else {
            setStreakData(null);
        }
    }, [user, fetchStreakData, cleanOldEntries]);

    const value = React.useMemo(() => ({
        streakData,
        isLoading,
        error,
        refetch: fetchStreakData,
        updateStreak
    }), [streakData, isLoading, error, fetchStreakData]);

    return (
        <StreakContext.Provider value={value}>
            {children}
        </StreakContext.Provider>
    );
};

export const useStreakContext = () => {
    const context = useContext(StreakContext);
    if (context === undefined) {
        throw new Error('useStreakContext must be used within a StreakProvider');
    }
    return context;
};
