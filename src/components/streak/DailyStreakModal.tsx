import React, { useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WeeklyStreakProgress } from '@/components/streak/WeeklyStreakProgress';
import { LottieIcon } from '@/components/ui/LottieIcon';
import fireAnimation from '@/assets/lottie/fuego_racha.lottie';
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import { useWeeklyStreakProgress } from '@/hooks/useWeeklyStreakProgress';
import { X } from 'lucide-react';

interface DailyStreakModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStreak: number;
    completedDays?: number[]; // Kept for backwards compatibility but we override it inside
}

export const DailyStreakModal: React.FC<DailyStreakModalProps> = ({
    open,
    onOpenChange,
    currentStreak,
    completedDays: parentCompletedDays
}) => {
    // Fetch weekly progress internally so it's always accurate
    const { completedDays: fetchedDays } = useWeeklyStreakProgress();
    const activeDays = fetchedDays.length > 0 ? fetchedDays : (parentCompletedDays || []);

    useEffect(() => {
        if (open) {
            // Trigger a quick pop of confetti when manually opened for delight
            const duration = 1500;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#F97316', '#FB923C', '#FFFFFF']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#F97316', '#FB923C', '#FFFFFF']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md w-[90vw] mx-auto border-none bg-zinc-950/90 backdrop-blur-3xl p-0 overflow-hidden rounded-[32px] gap-0 [&>button]:hidden">
                {/* Close Button Top Right */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative w-full flex flex-col items-center pt-10 pb-8 px-6">
                    {/* Background Central Glow */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />

                    {/* Title */}
                    <h2 className="text-3xl font-black italic tracking-tighter drop-shadow-lg text-center bg-clip-text text-transparent bg-gradient-to-tr from-orange-400 to-yellow-200 mb-6 z-10 pr-2 pb-1">
                        ¡Racha de {currentStreak} días!
                    </h2>

                    {/* Fire Animation */}
                    <div className="relative w-48 h-48 flex items-center justify-center z-10">
                        <LottieIcon
                            src={fireAnimation}
                            size={180}
                            style={{ filter: 'drop-shadow(0 0 15px rgba(249,115,22,0.3))' }}
                        />
                    </div>

                    <div className="text-center text-zinc-300 font-medium px-2 mt-4 z-10">
                        <p className="text-lg">
                            ¡Estás en llamas! Mantén tu racha entrenando cada día.
                        </p>
                    </div>

                    {/* Weekly Progress Component */}
                    <div className="w-full mt-6 mb-8 z-10">
                        <WeeklyStreakProgress
                            currentStreak={currentStreak}
                            completedDays={activeDays}
                            todayCompleted={true}
                        />
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-6 text-lg rounded-2xl shadow-[0_4px_25px_rgba(249,115,22,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] z-10"
                        onClick={() => onOpenChange(false)}
                    >
                        Continuar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
