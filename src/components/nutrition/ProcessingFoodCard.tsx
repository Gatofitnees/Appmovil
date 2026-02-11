
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ProgressRing from '@/components/ProgressRing';
import Button from '@/components/Button';
import { AlertTriangle, Zap } from 'lucide-react';

interface ProcessingFoodCardProps {
  imageUrl: string;
  className?: string;
  error?: string | null;
  isCompressing?: boolean;
  onRetry: () => void;
  onCancel: () => void;
}

const processingSteps = [
  { message: "Analizando imagen...", progress: 15 },
  { message: "Identificando alimentos...", progress: 35 },
  { message: "Calculando calorías...", progress: 55 },
  { message: "Estimando macros...", progress: 75 },
  { message: "Revisando ingredientes...", progress: 90 },
  { message: "Casi listo...", progress: 98 },
];

const compressionSteps = [
  { message: "Optimizando imagen...", progress: 25 },
  { message: "Comprimiendo archivo...", progress: 50 },
  { message: "Reduciendo tamaño...", progress: 75 },
  { message: "Preparando análisis...", progress: 90 },
];

export const ProcessingFoodCard: React.FC<ProcessingFoodCardProps> = ({
  imageUrl,
  className,
  error,
  isCompressing = false,
  onRetry,
  onCancel,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (error) return; // Stop interval on error

    const steps = isCompressing ? compressionSteps : processingSteps;
    const interval = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex + 1 < steps.length) {
          return prevIndex + 1;
        }
        clearInterval(interval);
        return prevIndex;
      });
    }, isCompressing ? 1000 : 2000); // Faster interval for compression

    return () => clearInterval(interval);
  }, [error, isCompressing]);

  const steps = isCompressing ? compressionSteps : processingSteps;
  const currentStep = steps[currentStepIndex];

  return (
    <div
      className={cn(
        "neu-card overflow-hidden rounded-xl",
        !error && "animate-pulse",
        className
      )}
    >
      <div className="flex h-28">
        <div className="relative w-28 h-28 flex-shrink-0">
          <img
            src={imageUrl}
            alt="Procesando alimento"
            className="w-full h-full object-cover rounded-l-xl"
          />
          {!error && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-l-xl">
              <ProgressRing
                progress={currentStep.progress}
                size={50}
                strokeWidth={5}
                className={isCompressing ? "text-yellow-500" : "text-primary"}
              />
              <span className="absolute text-xs font-bold text-white">
                {currentStep.progress}%
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 p-3 flex flex-col justify-center items-center rounded-r-xl">
          {error ? (
            <div className="text-center w-full">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h4 className="text-sm font-semibold text-red-500">Comida no detectada</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3 px-2">
                {error}
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={onRetry} size="sm" variant="secondary">
                  Reintentar
                </Button>
                <Button onClick={onCancel} size="sm" variant="outline">
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className={cn(
                "inline-block animate-spin rounded-full h-4 w-4 border-b-2",
                isCompressing ? "border-yellow-500" : "border-primary"
              )}></div>
              <div className="flex items-center gap-1">
                {isCompressing && <Zap className="h-3 w-3 text-yellow-500" />}
                <span className="text-sm font-medium text-muted-foreground text-center">
                  {currentStep.message}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
