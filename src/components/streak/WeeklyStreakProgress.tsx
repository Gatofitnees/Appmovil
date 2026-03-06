import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";

interface WeeklyStreakProgressProps {
    currentStreak: number;
    completedDays?: number[]; // 0-6 (Sun-Sat) or 1-7 (Mon-Sun), let's use JS Date getDay() 0=Sun, but usually UI is Mon-Sun
    todayCompleted?: boolean;
}

const DAYS = [
    { label: "L", value: 1 },
    { label: "M", value: 2 },
    { label: "X", value: 3 },
    { label: "J", value: 4 },
    { label: "V", value: 5 },
    { label: "S", value: 6 },
    { label: "D", value: 0 },
];

export const WeeklyStreakProgress: React.FC<WeeklyStreakProgressProps> = ({
    completedDays = [],
    todayCompleted = false
}) => {
    const today = new Date().getDay();
    const [animatedToday, setAnimatedToday] = useState(false);
    const { hapticImpact, ImpactStyle } = useHaptics();

    // Lightweight Web Audio API "pop" sound synthesizer
    const playPopSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            // Start at a higher pitch and drop quickly for a bubble/pop effect
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

            // Volume envelope: instant attack, quick decay
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);

            // Clean up
            setTimeout(() => {
                ctx.close().catch(() => { });
            }, 500);
        } catch (e) {
            console.warn('AudioContext not supported or blocked for pop sound.');
        }
    };

    useEffect(() => {
        if (todayCompleted && !animatedToday) {
            // Delay the completion mark so it feels like it "activates" after the modal opens
            const timer = setTimeout(() => {
                setAnimatedToday(true);
                playPopSound();
                hapticImpact(ImpactStyle.Light);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [todayCompleted, animatedToday, hapticImpact, ImpactStyle]);

    return (
        <div className="flex justify-between items-center w-full max-w-[280px] mx-auto mt-6">
            {DAYS.map((day) => {
                const isToday = day.value === today;

                // If it's today, we only consider it "completed" if the animation has fired
                const isCompleted = isToday
                    ? animatedToday
                    : completedDays.includes(day.value);

                return (
                    <div key={day.label} className="flex flex-col items-center gap-2">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                isCompleted
                                    ? "bg-orange-500 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                    : isToday
                                        ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                                        : "border-zinc-800 bg-zinc-900/50 text-muted-foreground",
                                isToday && animatedToday && "animate-in zoom-in spin-in-12 duration-500"
                            )}
                        >
                            {isCompleted ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <span className="text-xs font-medium">{day.label}</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
