import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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

    return (
        <div className="flex justify-between items-center w-full max-w-[280px] mx-auto mt-6">
            {DAYS.map((day) => {
                const isCompleted = completedDays.includes(day.value) || (day.value === today && todayCompleted);
                const isToday = day.value === today;

                return (
                    <div key={day.label} className="flex flex-col items-center gap-2">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                isCompleted
                                    ? "bg-orange-500 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                    : isToday
                                        ? "border-orange-500/50 bg-orange-500/10 text-orange-500"
                                        : "border-zinc-800 bg-zinc-900/50 text-muted-foreground"
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
