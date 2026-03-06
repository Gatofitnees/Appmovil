import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StreakShieldIcon } from '@/components/streak/StreakShieldIcon';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface StreakShieldModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    freezeCount: number;
    maxCapacity: number;
}

export const StreakShieldModal: React.FC<StreakShieldModalProps> = ({
    open,
    onOpenChange,
    freezeCount,
    maxCapacity
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md w-[90vw] mx-auto border-none bg-zinc-950 p-0 overflow-hidden rounded-[32px] gap-0 [&>button]:hidden">
                {/* Close Button Top Right */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative w-full flex flex-col items-center pt-10 pb-8 px-6">
                    {/* Title */}
                    <h2 className="text-3xl font-black italic tracking-tighter drop-shadow-lg text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-200 mb-6 z-10 pr-2 pb-1">
                        Protector de Racha
                    </h2>

                    {/* Main Animation in circle container (same pattern that worked before) */}
                    <div className="relative w-48 h-48 flex items-center justify-center z-10">
                        <div className="absolute inset-0 bg-blue-900/40 rounded-full" />
                        <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full animate-pulse" />
                        <StreakShieldIcon className="w-40 h-40 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] -ml-1" />
                    </div>

                    <div className="text-center space-y-4 z-10 w-full mt-4">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                            Tienes {freezeCount} de {maxCapacity} Escudos
                        </h3>

                        {/* Sci-fi Shield Slots */}
                        <div className="flex justify-center gap-3 my-4">
                            {[...Array(maxCapacity)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`relative w-12 h-2 rounded-full overflow-hidden transition-all duration-500 `}
                                >
                                    <div className="absolute inset-0 bg-slate-800/50" />
                                    <div
                                        className={`absolute inset-0 transition-all duration-700 ${i < freezeCount
                                            ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)] opacity-100'
                                            : 'bg-blue-500 opacity-0'
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>

                        <p className="text-blue-300/80 text-sm font-medium mt-4 pb-6 px-4">
                            ¡Gana uno nuevo cada 7 días de racha perfecta!
                        </p>
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-6 text-lg rounded-2xl shadow-[0_4px_25px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] z-10"
                        onClick={() => onOpenChange(false)}
                    >
                        Entendido
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
