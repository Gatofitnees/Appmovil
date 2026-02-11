
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EditableIngredient } from './EditableIngredient';

interface Ingredient {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface IngredientsSectionProps {
  ingredients: Ingredient[];
  showIngredients: boolean;
  onToggleShow: () => void;
  onIngredientClick: (index: number, field: string, value: string | number) => void;
}

export const IngredientsSection: React.FC<IngredientsSectionProps> = ({
  ingredients,
  showIngredients,
  onToggleShow,
  onIngredientClick
}) => {
  return (
    <div className="neu-card p-4 mb-4">
      <button
        onClick={onToggleShow}
        className="flex items-center justify-between w-full text-sm font-medium"
      >
        <span>Ingredientes</span>
        {showIngredients ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {showIngredients && (
        <div className="mt-3 space-y-3">
          {ingredients.map((ingredient, index) => (
            <EditableIngredient
              key={index}
              {...ingredient}
              onClick={(field, value) => onIngredientClick(index, field, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
