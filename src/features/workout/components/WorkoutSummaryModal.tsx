import React, { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gauge, Clock, TrendingUp, TrendingDown, Minus, Zap } from "lucide-react"; // Added Zap
import { PerformanceStats } from "../hooks/useWorkoutPerformance";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import confetti from 'canvas-confetti';

// Import Lottie Animations
import trophyGold from '@/assets/lottie/Trophy.lottie';
import trophySilver from '@/assets/lottie/Trophy-3.lottie';
import trophyBronze from '@/assets/lottie/Trophy-2.lottie';

interface WorkoutSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: PerformanceStats | null;
    durationMinutes: number;
    xpGained: number;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
    isOpen,
    onClose,
    stats,
    durationMinutes,
    xpGained
}) => {

    // Confetti Effect for High Scores or Improvements
    useEffect(() => {
        if (isOpen && stats && (stats.score >= 80 || stats.improvedCount > 0)) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FACC15', '#FDE047', '#FFFFFF'], // Yellow/Gold colors
                    zIndex: 1000, // Ensure it's above the modal
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FACC15', '#FDE047', '#FFFFFF'],
                    zIndex: 1000,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen, stats]);

    if (!stats) return null;

    // determine attributes based on score
    const getAttributes = (score: number) => {
        if (score >= 80) {
            return {
                animation: trophyGold,
                color: "text-yellow-500",
                borderColor: "border-yellow-500/20",
                bgGlow: "bg-yellow-500/20",
                buttonColor: "bg-yellow-500 hover:bg-yellow-400 text-black",
                buttonShadow: "shadow-[0_4px_20px_rgba(234,179,8,0.3)]"
            };
        }
        if (score >= 60) {
            return {
                animation: trophySilver,
                color: "text-teal-400",
                borderColor: "border-teal-400/20",
                bgGlow: "bg-teal-400/10",
                buttonColor: "bg-teal-500 hover:bg-teal-400 text-white",
                buttonShadow: "shadow-[0_4px_20px_rgba(20,184,166,0.3)]"
            };
        }
        return {
            animation: trophyBronze,
            color: "text-purple-500",
            borderColor: "border-purple-500/20",
            bgGlow: "bg-purple-500/10",
            buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
            buttonShadow: "shadow-[0_4px_20px_rgba(147,51,234,0.3)]"
        };
    };

    const attrs = getAttributes(stats.score);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="h-screen w-screen max-w-none m-0 rounded-none bg-zinc-950 border-none p-0 overflow-hidden gap-0 [&>button]:hidden">
                <div className="relative h-full w-full flex flex-col">

                    {/* Background Glow */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[120px] pointer-events-none ${attrs.bgGlow}`} />

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full z-10 px-6 space-y-6 overflow-y-auto py-6 no-scrollbar">

                        {/* Animation - Responsive Size - Increased */}
                        <div className="w-64 h-64 md:w-80 md:h-80 relative shrink-0 mb-2">
                            <DotLottieReact
                                src={attrs.animation}
                                loop
                                autoplay
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>

                        {/* Title & Subtitle */}
                        <div className="text-center space-y-2">
                            <h2 className={`text-3xl md:text-4xl font-black italic tracking-tighter drop-shadow-xl text-white`}>
                                {stats.feedbackTitle}
                            </h2>
                            <p className="text-zinc-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                                {stats.feedbackSubtitle}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="w-full max-w-sm space-y-3">
                            {/* XP, Time, Volume Row - 3 Cols */}
                            <div className="grid grid-cols-3 gap-2">
                                {/* XP */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-2 flex flex-col items-center justify-center space-y-0.5 min-h-[70px]">
                                    <span className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">XP</span>
                                    <div className="flex items-center gap-1">
                                        <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-lg font-black text-white">{xpGained}</span>
                                    </div>
                                </div>
                                {/* Time */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-2 flex flex-col items-center justify-center space-y-0.5 min-h-[70px]">
                                    <span className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">TIEMPO</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-lg font-bold text-white">{durationMinutes}m</span>
                                    </div>
                                </div>
                                {/* Volume - Moved here */}
                                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-2 flex flex-col items-center justify-center space-y-0.5 min-h-[70px]">
                                    <span className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">VOLUMEN</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-lg font-black text-white">
                                            {stats.totalVolume ? Math.round(stats.totalVolume).toLocaleString() : '0'}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 font-medium self-end mb-0.5">kg</span>
                                    </div>
                                </div>
                            </div>

                            {/* Performance Card */}
                            <div className={`bg-zinc-900/80 border ${attrs.borderColor} rounded-2xl p-5 space-y-5`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Gauge className={`w-5 h-5 ${attrs.color}`} />
                                        <span className="font-bold text-white">Rendimiento</span>
                                    </div>
                                    <span className={`text-3xl font-black ${attrs.color}`}>{stats.score}%</span>
                                </div>

                                {/* Mini Stats */}
                                <div className="grid grid-cols-3 divide-x divide-white/5">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Mejoraste</span>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="font-bold text-lg">{stats.improvedCount}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Mantuviste</span>
                                        <div className="flex items-center gap-1 text-teal-400">
                                            <Minus className="w-3 h-3" />
                                            <span className="font-bold text-lg">{stats.maintainedCount}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">Bajaste</span>
                                        <div className="flex items-center gap-1 text-purple-500">
                                            <TrendingDown className="w-3 h-3" />
                                            <span className="font-bold text-lg">{stats.worsenedCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Button Only */}
                    <div className="w-full max-w-md mx-auto px-6 mb-8 z-10 flex h-16 shrink-0">
                        {/* Action Button */}
                        <Button
                            className={`w-full h-full text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${attrs.buttonColor} ${attrs.buttonShadow}`}
                            onClick={onClose}
                        >
                            CONTINUAR
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
