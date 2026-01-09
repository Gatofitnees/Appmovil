import React, { useEffect, useState, useRef } from "react";
import { useStreaks } from "@/hooks/useStreaks";
import { StreakSuccessModal } from "./StreakSuccessModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, format } from "date-fns";

export const StreakListener: React.FC = () => {
    console.log('[StreakListener] Render - Checking presence');
    const { streakData } = useStreaks();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [completedDays, setCompletedDays] = useState<number[]>([]);

    useEffect(() => {
        if (!streakData || !user) {
            console.log('[StreakListener] Waiting for data:', { hasStreak: !!streakData, hasUser: !!user });
            return;
        };

        const STORAGE_KEY = `gatofit_streak_ack_${user.id}`;
        const storedValue = localStorage.getItem(STORAGE_KEY);

        console.log('[StreakListener] Check:', {
            current: streakData.current_streak,
            stored: storedValue,
            key: STORAGE_KEY
        });

        // First time initialization on this device
        if (storedValue === null) {
            console.log('[StreakListener] No stored value found.');
            // Special case: If streak is 1, it implies a transition from 0 happened today.
            // We should show the modal even if we don't have prior storage history.
            if (streakData.current_streak === 1) {
                console.log('[StreakListener] First streak detected (streak=1)! Showing modal.');
                setShowModal(true);
                fetchWeeklyProgress();
                localStorage.setItem(STORAGE_KEY, '1');
            } else {
                console.log('[StreakListener] Initializing streak storage to current (suppressing modal):', streakData.current_streak);
                localStorage.setItem(STORAGE_KEY, streakData.current_streak.toString());
            }
            return;
        }

        const lastAckStreak = parseInt(storedValue, 10);

        // Check if streak increased (strict increase to avoid showing on same value)
        if (streakData.current_streak > lastAckStreak) {
            console.log('[StreakListener] Streak INCREASE DETECTED!', {
                from: lastAckStreak,
                to: streakData.current_streak
            });
            setShowModal(true);
            fetchWeeklyProgress();

            // Update storage immediately
            localStorage.setItem(STORAGE_KEY, streakData.current_streak.toString());
        } else if (streakData.current_streak < lastAckStreak) {
            // Handle case where streak breaks/drops (sync storage down)
            console.log('[StreakListener] Streak dropped, syncing storage down', {
                from: lastAckStreak,
                to: streakData.current_streak
            });
            localStorage.setItem(STORAGE_KEY, streakData.current_streak.toString());
        } else {
            console.log('[StreakListener] No change in streak.');
        }
    }, [streakData?.current_streak, user?.id]);

    const fetchWeeklyProgress = async () => {
        if (!user) return;

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
                    // log_date is usually YYYY-MM-DD string, new Date parses it as UTC usually, but getDay() depends on local.
                    // Better to be careful. date-fns parse might be safer or just standard Date.
                    // Assuming format YYYY-MM-DD
                    const [y, m, d] = log.log_date.split('-').map(Number);
                    const date = new Date(y, m - 1, d);
                    days.add(date.getDay());
                });
            }

            setCompletedDays([...days]);

        } catch (e) {
            console.error("Error fetching weekly progress for streak:", e);
        }
    };

    if (!streakData) return null;

    return (
        <StreakSuccessModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            streakCount={streakData.current_streak}
            completedDays={completedDays}
        />
    );
};
