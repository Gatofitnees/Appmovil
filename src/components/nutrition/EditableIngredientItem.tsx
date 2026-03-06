import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit3 } from 'lucide-react';
import NutrientIcon from '@/components/nutrition/NutrientIcon';
import { NumericInput } from '@/components/ui/numeric-input';

interface EditableIngredientItemProps {
  ingredient: any;
  checked: boolean;
  quantity: number;
  onCheck: (checked: boolean) => void;
  onQuantityChange: (quantity: number) => void;
}

export const EditableIngredientItem: React.FC<EditableIngredientItemProps> = React.memo(({
  ingredient,
  checked,
  quantity,
  onCheck,
  onQuantityChange
}) => {
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(quantity.toString());

  const handleQuantityEdit = () => {
    setTempQuantity(quantity.toString());
    setIsEditingQuantity(true);
  };

  const handleQuantitySave = () => {
    const newQuantity = parseFloat(tempQuantity);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onQuantityChange(newQuantity);
    }
    setIsEditingQuantity(false);
  };

  const handleQuantityCancel = () => {
    setTempQuantity(quantity.toString());
    setIsEditingQuantity(false);
  };

  // Calculate scaled macros based on current quantity vs original quantity
  const scale = quantity / ingredient.quantity_grams;
  const scaledCalories = ingredient.calories_per_serving * scale;
  const scaledProtein = ingredient.protein_g_per_serving * scale;
  const scaledCarbs = ingredient.carbs_g_per_serving * scale;
  const scaledFat = ingredient.fats_g_per_serving * scale;

  return (
    <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:bg-secondary/20 transition-colors">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheck}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-foreground truncate">
            {ingredient.custom_food_name || ingredient.recipe_name || ingredient.food_items?.name || 'Alimento sin nombre'}
          </h4>

          <div className="flex items-center gap-2">
            {isEditingQuantity ? (
              <div className="flex items-center gap-1">
                <NumericInput
                  allowDecimals
                  value={tempQuantity}
                  onChange={(e) => setTempQuantity(e.target.value)}
                  className="w-16 h-7 text-xs items-center p-1 text-center font-medium"
                />
                <span className="text-xs text-muted-foreground">g</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleQuantitySave}
                  className="h-7 w-7 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleQuantityCancel}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleQuantityEdit}
                  className="h-7 px-2 text-xs"
                >
                  {Math.round(quantity)}g
                  <Edit3 className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <NutrientIcon
            type="calories"
            value={scaledCalories}
            unit="kcal"
            className="text-xs"
          />
          <NutrientIcon
            type="protein"
            value={scaledProtein}
            className="text-xs"
          />
          <NutrientIcon
            type="carbs"
            value={scaledCarbs}
            className="text-xs"
          />
          <NutrientIcon
            type="fat"
            value={scaledFat}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.checked === nextProps.checked &&
    prevProps.quantity === nextProps.quantity &&
    prevProps.ingredient.id === nextProps.ingredient.id
  );
});