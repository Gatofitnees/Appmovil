import { useEffect, useRef, useState } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App } from "@capacitor/app";

type TimerStatus = "idle" | "running" | "paused";

export function useRestTimer(defaultSeconds: number = 60) {
  const [remaining, setRemaining] = useState<number>(defaultSeconds);
  const [duration, setDuration] = useState<number>(defaultSeconds);
  const [status, setStatus] = useState<TimerStatus>("idle");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationIdRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for in-app feedback
  useEffect(() => {
    // Note: On some mobile browsers/webviews, audio needs user interaction to play.
    // Since the user clicks "Start Timer", we have that interaction.
    const audio = new Audio('/notification.wav');
    audio.preload = 'auto';
    audioRef.current = audio;
  }, []);

  const clearIntervalTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const cancelNotification = async () => {
    if (notificationIdRef.current !== null) {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: notificationIdRef.current }] });
      } catch (error) {
        // Ignore cancellation errors.
      }
    }
    notificationIdRef.current = null;
  };

  const scheduleNotification = async (seconds: number) => {
    if (seconds <= 0) return;
    try {
      await LocalNotifications.requestPermissions();
    } catch (error) {
      // Permissions fail
    }

    await cancelNotification();

    const fireDate = new Date(Date.now() + seconds * 1000);
    const notificationId = 99999; // Constant ID for rest timer to avoid duplicates
    notificationIdRef.current = notificationId;
    targetTimeRef.current = fireDate.getTime();

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: "¡Descanso terminado!",
            body: "Vuelve a tu siguiente serie o ejercicio.",
            schedule: { at: fireDate },
            sound: 'notification',
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#3B82F6',
          }
        ]
      });
    } catch (error) {
      // Scheduling failures
    }
  };

  const beginCountdown = (seconds: number) => {
    clearIntervalTimer();
    targetTimeRef.current = Date.now() + seconds * 1000;
    intervalRef.current = setInterval(async () => {
      const diffMs = (targetTimeRef.current || 0) - Date.now();
      const next = Math.max(0, Math.ceil(diffMs / 1000));

      setRemaining(next);

      if (next <= 0) {
        clearIntervalTimer();
        targetTimeRef.current = null;
        setStatus("idle");

        // Foreground vs Background logic
        const state = await App.getState();

        if (state.isActive) {
          // In app: Just play sound and cancel the system notification (if it hasn't fired yet)
          console.log("⏱️ Timer finished in foreground. Playing sound...");
          await cancelNotification();
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.warn("Audio play failed:", e));
          }
        } else {
          // In background: The scheduled notification will fire naturally
          console.log("⏱️ Timer finished in background. System notification handled it.");
          notificationIdRef.current = null;
        }
      }
    }, 1000);
  };

  const start = async (seconds?: number) => {
    const durationToUse = seconds ?? defaultSeconds;
    setDuration(durationToUse);
    setRemaining(durationToUse);
    setStatus("running");
    beginCountdown(durationToUse);
    await scheduleNotification(durationToUse);
  };

  const pause = async () => {
    if (status !== "running") return;
    clearIntervalTimer();
    targetTimeRef.current = null;
    await cancelNotification();
    setStatus("paused");
  };

  const resume = async () => {
    if (status !== "paused") return;
    if (remaining <= 0) {
      await start(defaultSeconds);
      return;
    }
    setStatus("running");
    beginCountdown(remaining);
    await scheduleNotification(remaining);
  };

  const end = async () => {
    clearIntervalTimer();
    targetTimeRef.current = null;
    await cancelNotification();
    setRemaining(defaultSeconds);
    setDuration(defaultSeconds);
    setStatus("idle");
  };

  const adjust = async (deltaSeconds: number) => {
    let nextRemaining = 0;
    setRemaining((prev) => {
      nextRemaining = Math.max(0, prev + deltaSeconds);
      return nextRemaining;
    });
    setDuration((prev) => Math.max(nextRemaining || defaultSeconds, prev + deltaSeconds));

    if (status === "running") {
      if (nextRemaining <= 0) {
        await end();
        return;
      }
      beginCountdown(nextRemaining);
      await scheduleNotification(nextRemaining);
    }
  };

  useEffect(() => {
    return () => {
      clearIntervalTimer();
      targetTimeRef.current = null;
      cancelNotification();
    };
  }, []);

  return {
    remaining,
    duration,
    status,
    isRunning: status === "running",
    isPaused: status === "paused",
    start,
    pause,
    resume,
    end,
    adjust,
  };
}
