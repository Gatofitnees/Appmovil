
import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { FlatIcon } from '@/components/ui/FlatIcon';
import { cn, formatMacroValue } from '@/lib/utils';

interface FoodPreviewCardProps {
  imageUrl: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const FoodPreviewCard: React.FC<FoodPreviewCardProps> = ({
  imageUrl,
  name,
  calories,
  protein,
  carbs,
  fat,
  loggedAt,
  onClick,
  onDelete,
  className
}) => {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para truncado inteligente del texto
  const intelligentTruncate = (text: string, maxLength: number = 18) => {
    if (text.length <= maxLength) return text;

    // Buscar el último espacio antes del límite
    const truncateIndex = text.lastIndexOf(' ', maxLength);

    // Si no hay espacios, cortar directamente
    if (truncateIndex === -1) {
      return text.substring(0, maxLength) + '...';
    }

    return text.substring(0, truncateIndex) + '...';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;

    currentX.current = e.touches[0].clientX;
    const distance = startX.current - currentX.current;

    if (distance > 0) {
      setSwipeDistance(Math.min(distance, 80));
    }
  };

  const handleTouchEnd = () => {
    if (swipeDistance > 60 && onDelete) {
      onDelete();
    } else {
      setSwipeDistance(0);
    }
    setIsSwipeActive(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsSwipeActive(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwipeActive) return;

    currentX.current = e.clientX;
    const distance = startX.current - currentX.current;

    if (distance > 0) {
      setSwipeDistance(Math.min(distance, 80));
    }
  };

  const handleMouseUp = () => {
    if (swipeDistance > 60 && onDelete) {
      onDelete();
    } else {
      setSwipeDistance(0);
    }
    setIsSwipeActive(false);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        ref={cardRef}
        className={cn(
          "neu-card cursor-pointer hover:bg-secondary/10 transition-all duration-200 relative overflow-hidden rounded-xl",
          className
        )}
        style={{ transform: `translateX(-${swipeDistance}px)` }}
        onClick={swipeDistance === 0 ? onClick : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Time stamp */}
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md z-10">
          {formatTime(loggedAt)}
        </div>

        <div className="flex h-28">
          {/* Food Image - Left Side */}
          <div className="w-28 h-28 flex-shrink-0">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover rounded-l-xl"
            />
          </div>

          {/* Food Details - Right Side */}
          <div className="flex-1 p-3 flex flex-col justify-center">
            {/* Food Name */}
            <h3 className="font-medium text-sm mb-1 leading-tight">
              {intelligentTruncate(name)}
            </h3>

            {/* Calories - Main Line */}
            <div className="flex items-center gap-2 mb-1">
              <img src="/flame.svg" alt="Calories" className="w-4 h-4 flex-shrink-0 brightness-0 invert -translate-y-0.5" />
              <span className="text-lg font-bold">{calories} kcal</span>
            </div>

            {/* Macronutrients */}
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <FlatIcon name="sr-drumstick" size={12} style={{ color: '#dd6969' }} className="flex-shrink-0" />
                <span className="font-medium">{formatMacroValue(protein)}g</span>
              </div>

              <div className="flex items-center gap-1.5">
                <FlatIcon name="sr-wheat" size={12} style={{ color: '#EB9F6D' }} className="flex-shrink-0" />
                <span className="font-medium">{formatMacroValue(carbs)}g</span>
              </div>

              <div className="flex items-center gap-1.5">
                <FlatIcon name="sr-avocado" size={12} style={{ color: '#6C95DC' }} className="flex-shrink-0" />
                <span className="font-medium">{formatMacroValue(fat)}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      {swipeDistance > 20 && (
        <div
          className="absolute right-0 top-0 h-full flex items-center justify-center bg-red-500 text-white rounded-r-xl"
          style={{ width: `${Math.min(swipeDistance, 80)}px` }}
        >
          <Trash2 className="h-5 w-5" />
        </div>
      )}
    </div>
  );
};
