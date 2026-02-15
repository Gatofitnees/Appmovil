import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useLocalTimezone } from './useLocalTimezone';

interface DailyNotification {
  id: number;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

const workoutNotifications: DailyNotification[] = [
  { id: 1, title: "💪 ¡Hora de entrenar!", body: "Es momento de registrar tu entrenamiento del día. ¡Vamos con todo!", hour: 12, minute: 0 },
  { id: 2, title: "🔥 Tu cuerpo te espera", body: "¿Ya registraste tu entrenamiento? ¡Dale seguimiento a tu progreso!", hour: 12, minute: 0 },
  { id: 3, title: "⚡ ¡A darle duro!", body: "Registra tu sesión de hoy y mantén tu racha activa", hour: 12, minute: 0 },
];

const mealNotifications: DailyNotification[] = [
  { id: 4, title: "🍽️ Registra tu comida", body: "¿Ya registraste lo que comiste hoy? Mantén tu progreso nutricional al día", hour: 18, minute: 0 },
  { id: 5, title: "🥗 Control nutricional", body: "Es hora de registrar tus comidas del día. ¡Cada detalle cuenta!", hour: 18, minute: 0 },
  { id: 6, title: "📊 Actualiza tu nutrición", body: "Registra tu alimentación y alcanza tus objetivos más rápido", hour: 18, minute: 0 },
];

export const useDailyNotifications = () => {
  const { getCurrentLocalDate, getLocalDayRange } = useLocalTimezone();

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    if (!Capacitor.isNativePlatform()) return;

    const setupNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 0. Request Permissions Explicitly on Load
        const permStatus = await LocalNotifications.checkPermissions();
        if (permStatus.display !== 'granted') {
          const request = await LocalNotifications.requestPermissions();
          if (request.display !== 'granted') {
            console.warn('User denied notification permissions');
            return;
          }
        }

        // 1. Check today's status
        const todayStr = getCurrentLocalDate();
        const { startOfDay, endOfDay } = getLocalDayRange(new Date());

        const [workoutRes, foodRes] = await Promise.all([
          supabase.from('workout_logs').select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('workout_date', startOfDay)
            .lte('workout_date', endOfDay),
          supabase.from('daily_food_log_entries').select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('log_date', todayStr)
        ]);

        const hasWorkout = (workoutRes.count ?? 0) > 0;
        const hasMeal = (foodRes.count ?? 0) > 0;

        // 2. Clear previous schedules (IDs 1-20 to be safe)
        const idsToCancel = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));
        await LocalNotifications.cancel({ notifications: idsToCancel });

        const now = new Date();
        const notificationsToSchedule = [];

        // Cycle through notifications based on date
        const dayOfMonth = now.getDate();
        const wIdx = dayOfMonth % workoutNotifications.length;
        const mIdx = dayOfMonth % mealNotifications.length;

        // 3. Schedule Workout Reminder (12:00 PM)
        if (!hasWorkout) {
          const scheduleTime = new Date();
          scheduleTime.setHours(12, 0, 0, 0);

          // If 12 PM today has passed, check if we should schedule for tomorrow?
          // Logic: "Schedule for tomorrow" seems risky if the user hasn't done it *today*.
          // But maybe they want to be reminded tomorrow at 12?
          // Current logic: If 12 PM passed, modify checks for *tomorrow*? No.
          // Correct logic: If 12 PM passed, schedule for tomorrow ONLY IF we don't want a late notification today.
          // BUT the user might want a notification NOW if they haven't done it.
          // Let's keep existing logic but just fix the "tomorrow" check to be safe.

          if (scheduleTime <= now) {
            scheduleTime.setDate(scheduleTime.getDate() + 1);
          }

          notificationsToSchedule.push({
            id: 1,
            title: workoutNotifications[wIdx].title,
            body: workoutNotifications[wIdx].body,
            schedule: { at: scheduleTime },
            channelId: 'gatofit-workouts',
            autoCancel: true,
            sound: 'notification',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#3B82F6',
          });
        }

        // 4. Schedule Meal Reminder (6:00 PM)
        if (!hasMeal) {
          const scheduleTime = new Date();
          scheduleTime.setHours(18, 0, 0, 0);

          if (scheduleTime <= now) {
            scheduleTime.setDate(scheduleTime.getDate() + 1);
          }

          notificationsToSchedule.push({
            id: 2,
            title: mealNotifications[mIdx].title,
            body: mealNotifications[mIdx].body,
            schedule: { at: scheduleTime },
            channelId: 'gatofit-meals',
            autoCancel: true,
            sound: 'notification',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#3B82F6',
          });
        }

        if (notificationsToSchedule.length > 0) {
          await LocalNotifications.schedule({ notifications: notificationsToSchedule });
          console.log(`🔔 Scheduled ${notificationsToSchedule.length} notifications`);
        } else {
          console.log('✅ No notifications needed for today');
        }

      } catch (error) {
        console.error('Failed to set up notifications:', error);
      }
    };

    setupNotifications();

    // Re-verify when app becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setupNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getCurrentLocalDate, getLocalDayRange]);
};
