import React from 'react';
import { FlatIcon } from '@/components/ui/FlatIcon';

interface EditableIngredientProps {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onClick: (field: string, value: string | number) => void;
}

export const EditableIngredient: React.FC<EditableIngredientProps> = ({
  name,
  grams,
  calories,
  protein,
  carbs,
  fat,
  onClick
}) => {
  return (
    <div className="neu-card p-4 space-y-3">
      {/* Nombre e ingrediente con gramos */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <button
            onClick={() => onClick('name', name)}
            className="text-sm font-medium text-left hover:text-primary transition-colors block w-full"
          >
            {name}
          </button>
          <div className="text-xs text-muted-foreground mt-1">
            <button
              onClick={() => onClick('grams', grams)}
              className="hover:text-primary transition-colors"
            >
              {grams}g
            </button>
          </div>
        </div>

        {/* Macros a la derecha */}
        <div className="flex flex-col gap-2">
          {/* Fila superior: Calorías */}
          <div className="flex items-center gap-2 justify-end">
            <img src="/flame.svg" alt="Calories" className="w-3 h-3 brightness-0 invert -translate-y-0.5" />
            <button
              onClick={() => onClick('calories', calories)}
              className="text-xs font-medium hover:text-primary transition-colors"
            >
              {calories}
            </button>
            <span className="text-xs text-muted-foreground">kcal</span>
          </div>

          {/* Fila inferior: Macros */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <FlatIcon name="sr-drumstick" size={12} style={{ color: '#dd6969' }} />
              <button
                onClick={() => onClick('protein', protein)}
                className="text-xs hover:text-primary transition-colors"
              >
                {protein}g
              </button>
            </div>

            <div className="flex items-center gap-1">
              <FlatIcon name="sr-wheat" size={12} style={{ color: '#EB9F6D' }} />
              <button
                onClick={() => onClick('carbs', carbs)}
                className="text-xs hover:text-primary transition-colors"
              >
                {carbs}g
              </button>
            </div>

            <div className="flex items-center gap-1">
              <FlatIcon name="sr-avocado" size={12} style={{ color: '#6C95DC' }} />
              <button
                onClick={() => onClick('fat', fat)}
                className="text-xs hover:text-primary transition-colors"
              >
                {fat}g
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
