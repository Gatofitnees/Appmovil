import React, { useEffect, useState } from "react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import fireAnimation from '@/assets/lottie/fuego_racha.lottie';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WeeklyStreakProgress } from "./WeeklyStreakProgress";
import confetti from 'canvas-confetti';

interface StreakSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    streakCount: number;
    completedDays?: number[];
}

export const StreakSuccessModal: React.FC<StreakSuccessModalProps> = ({
    isOpen,
    onClose,
    streakCount,
    completedDays = []
}) => {
    const [displayCount, setDisplayCount] = useState(streakCount > 0 ? streakCount - 1 : 0);

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3000;
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

            // Animate number
            const timer = setTimeout(() => {
                setDisplayCount(streakCount);
            }, 500);

            return () => clearTimeout(timer);
        } else {
            // Reset when closed
            setDisplayCount(streakCount > 0 ? streakCount - 1 : 0);
        }
    }, [isOpen, streakCount]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="h-screen w-screen max-w-none m-0 rounded-none bg-zinc-950 border-none p-0 overflow-hidden gap-0 [&>button]:hidden">
                <div className="relative h-full w-full flex flex-col">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />

                    {/* Main Content - Takes available space */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full z-10 space-y-6">
                        {/* Fire Animation */}
                        <div className="w-48 h-48 relative">
                            <DotLottieReact
                                src={fireAnimation}
                                loop
                                autoplay
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>

                        {/* Text Content */}
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black italic text-white tracking-tighter drop-shadow-xl">
                                ¡RACHA EN LLAMAS!
                            </h2>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-orange-400 to-yellow-200"
                                    style={{
                                        filter: "drop-shadow(0 4px 6px rgba(249, 115, 22, 0.4))"
                                    }}
                                >
                                    {displayCount}
                                </span>
                                <span className="text-2xl font-bold text-zinc-400">DÍAS</span>
                            </div>
                        </div>

                        {/* Weekly Progress */}
                        <div>
                            <WeeklyStreakProgress
                                currentStreak={streakCount}
                                completedDays={completedDays}
                                todayCompleted={true}
                            />
                        </div>
                    </div>

                    {/* Footer Button - Pushed up by padding */}
                    <div className="w-full max-w-md mx-auto px-6 pb-24 z-10">
                        <Button
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-8 text-xl rounded-2xl shadow-[0_4px_30px_rgba(249,115,22,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            ¡A SEGUIR ASÍ! 🔥
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
