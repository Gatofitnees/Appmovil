
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WeeklyStreakProgress } from '@/components/streak/WeeklyStreakProgress';
import { LottieIcon } from '@/components/ui/LottieIcon';
import fireAnimation from '@/assets/lottie/fuego_racha.lottie';
import { Button } from "@/components/ui/button";

interface DailyStreakModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStreak: number;
    completedDays: number[];
}

export const DailyStreakModal: React.FC<DailyStreakModalProps> = ({
    open,
    onOpenChange,
    currentStreak,
    completedDays
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-orange-500/20 bg-slate-900/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold text-orange-500">
                        ¡Racha de {currentStreak} días!
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    {/* Fire Animation */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
                        <LottieIcon
                            src={fireAnimation}
                            size={160}
                            className="drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                        />
                    </div>

                    <div className="text-center text-slate-300 px-4">
                        <p>
                            ¡Estás en llamas! Mantén tu racha entrenando cada día.
                        </p>
                    </div>

                    {/* Weekly Progress */}
                    <div className="w-full">
                        <WeeklyStreakProgress
                            currentStreak={currentStreak}
                            completedDays={completedDays}
                            todayCompleted={true} // Assuming true for now, logic should come from parent if needed
                        />
                    </div>

                    <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20 mt-4"
                        onClick={() => onOpenChange(false)}
                    >
                        Continuar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
