import React, { useEffect, useState, useRef } from "react";
import { useStreaks } from "@/hooks/useStreaks";
import { StreakSuccessModal } from "./StreakSuccessModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { useLocalTimezone } from "@/hooks/useLocalTimezone";

export const StreakListener: React.FC = () => {
    console.log('[StreakListener] Render - Checking presence');
    const { streakData } = useStreaks();
    const { user } = useAuth();
    const { getLocalDateString } = useLocalTimezone();
    const [showModal, setShowModal] = useState(false);
    const [completedDays, setCompletedDays] = useState<number[]>([]);

    useEffect(() => {
        if (!streakData || !user) {
            console.log('[StreakListener] Waiting for data:', { hasStreak: !!streakData, hasUser: !!user });
            return;
        };

        const STORAGE_KEY = `gatofit_streak_ack_date_${user.id}`;
        const lastAckDate = localStorage.getItem(STORAGE_KEY);
        const localDate = getLocalDateString(new Date());

        console.log('[StreakListener] Check:', {
            last_activity: streakData.last_activity_date,
            localDate: localDate,
            lastAck: lastAckDate
        });

        // Solo mostrar si la última actividad de racha es HOY (local) 
        // y NO hemos mostrado ya el modal hoy en este dispositivo.
        if (streakData.last_activity_date === localDate && lastAckDate !== localDate) {
            console.log('[StreakListener] Activity completed today! Showing modal.');
            setShowModal(true);
            fetchWeeklyProgress();

            // Update storage immediately so we don't show it again today
            localStorage.setItem(STORAGE_KEY, localDate);
        } else if (streakData.last_activity_date !== localDate) {
            console.log('[StreakListener] No valid newly completed activity for today.');
        } else {
            console.log('[StreakListener] Modal already shown today.');
        }
    }, [streakData?.last_activity_date, user?.id, getLocalDateString]);

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
