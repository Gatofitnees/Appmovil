
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StreakShieldIcon } from '@/components/streak/StreakShieldIcon';
import { Button } from "@/components/ui/button";

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
            <DialogContent className="sm:max-w-md border-blue-500/20 bg-slate-900/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        Protector de Racha
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                    {/* Main Animation */}
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                        <StreakShieldIcon className="w-40 h-40 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] -ml-1" />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-white">
                            Tienes {freezeCount} de {maxCapacity} Escudos
                        </h3>
                        <div className="flex justify-center gap-1 my-2">
                            {[...Array(maxCapacity)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i < freezeCount ? 'bg-blue-500 shadow-[0_0_8px_tab(59,130,246,0.8)]' : 'bg-slate-700'
                                        }`}
                                />
                            ))}
                        </div>

                        <p className="text-blue-400 text-xs font-medium mt-2">
                            ¡Gana uno nuevo cada 7 días de racha perfecta!
                        </p>
                    </div>

                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20"
                        onClick={() => onOpenChange(false)}
                    >
                        Entendido
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
