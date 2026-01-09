import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ProgressRing";
import { Minus, Pause, Play, Plus } from "lucide-react";

interface RestTimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  remaining: number;
  duration: number;
  baseSeconds: number;
  status: "idle" | "running" | "paused";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onAdjust: (delta: number) => void;
}

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  open,
  onOpenChange,
  exerciseName,
  remaining,
  duration,
  baseSeconds,
  status,
  onStart,
  onPause,
  onResume,
  onEnd,
  onAdjust,
}) => {
  const progress = duration > 0 ? Math.min(100, ((duration - remaining) / duration) * 100) : 0;
  const isRunning = status === "running";
  const isPaused = status === "paused";

  const primaryLabel = isRunning ? "Pausar" : isPaused ? "Reanudar" : "Iniciar";
  const primaryIcon = isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />;

  const handlePrimary = () => {
    if (isRunning) return onPause();
    if (isPaused) return onResume();
    onStart();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl bg-background/95 p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">{exerciseName}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center gap-6">
          <div className="relative">
            <ProgressRing progress={progress} size={200} strokeWidth={8} />
            <div className="absolute inset-0 flex items-center justify-center -translate-y-1">
              <span className="text-4xl font-bold">{formatTime(remaining || baseSeconds)}</span>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-3 items-center">
            <div className="flex justify-center">
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={() => onAdjust(-10)}>
                <Minus className="h-5 w-5" />
              </Button>
            </div>
            <Button variant="default" size="lg" className="h-12 flex items-center justify-center gap-2" onClick={handlePrimary}>
              {primaryIcon}
              {primaryLabel}
            </Button>
            <div className="flex justify-center">
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={() => onAdjust(10)}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Button variant="outline" size="lg" className="w-full h-12" onClick={onEnd}>
            Terminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
