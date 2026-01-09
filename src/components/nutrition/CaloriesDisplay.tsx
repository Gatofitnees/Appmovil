
import React from 'react';
import { FlatIcon } from '@/components/ui/FlatIcon';
import { formatMacroValue } from '@/lib/utils';

interface CaloriesDisplayProps {
  calories: number;
}

export const CaloriesDisplay: React.FC<CaloriesDisplayProps> = ({ calories }) => {
  return (
    <div className="neu-card p-6 mb-4 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <img src="/flame.svg" alt="Calories" className="w-8 h-8 brightness-0 invert -translate-y-1" />
        <span className="text-3xl font-bold">{formatMacroValue(calories)}</span>
        <span className="text-lg text-muted-foreground">kcal</span>
      </div>
      <p className="text-sm text-muted-foreground">Calorías totales</p>
    </div>
  );
};
