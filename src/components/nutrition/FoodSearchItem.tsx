import React from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FlatIcon } from '@/components/ui/FlatIcon';
// import { Flame, Beef, Wheat, Droplets } from 'lucide-react'; // Removed unused imports
import FoodCategoryBadge from './FoodCategoryBadge';
import { cn } from '@/lib/utils';

interface FoodSearchItemProps {
  food: {
    id: string;
    name: string;
    description: string;
    brand?: string;
    category?: string;
    subcategory?: string;
    categoryIcon?: string;
    categoryColor?: string;
    nutrition?: {
      calories: number;
      fat: number;
      carbs: number;
      protein: number;
      serving_size: string;
    };
  };
  isSelected: boolean;
  quantity: number;
  onToggleSelect: () => void;
  onQuantityChange: (quantity: number) => void;
}

const FoodSearchItem: React.FC<FoodSearchItemProps> = ({
  food,
  isSelected,
  quantity,
  onToggleSelect,
  onQuantityChange
}) => {
  const multiplier = quantity / 100;

  return (
    <Card className={cn(
      "p-4 space-y-3 cursor-pointer transition-colors",
      isSelected ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
    )}>
      {/* Header with checkbox, name, and category */}
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          className="mt-1 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">
                {food.name}
              </h3>
              {food.brand && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {food.brand}
                </p>
              )}
            </div>
            {food.category && (
              <FoodCategoryBadge
                category={food.category}
                subcategory={food.subcategory}
                icon={food.categoryIcon}
                color={food.categoryColor}
                className="shrink-0"
              />
            )}
          </div>

          {/* Horizontal macros display */}
          {food.nutrition && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-full">
                <img src="/flame.svg" alt="Cal" className="w-3.5 h-3.5 brightness-0 invert -translate-y-0.5" />
                <span className="text-xs font-bold">{Math.round(food.nutrition.calories * multiplier)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FlatIcon name="sr-drumstick" size={12} style={{ color: '#dd6969' }} />
                <span className="text-xs font-medium text-muted-foreground">{Math.round(food.nutrition.protein * multiplier)}g</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FlatIcon name="sr-wheat" size={12} style={{ color: '#EB9F6D' }} />
                <span className="text-xs font-medium text-muted-foreground">{Math.round(food.nutrition.carbs * multiplier)}g</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FlatIcon name="sr-avocado" size={12} style={{ color: '#6C95DC' }} />
                <span className="text-xs font-medium text-muted-foreground">{Math.round(food.nutrition.fat * multiplier)}g</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantity selector (only when selected) */}
      {isSelected && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Cantidad:</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            placeholder="100"
            min="1"
            max="2000"
            step="1"
            className="w-20 h-8 text-xs"
          />
          <Badge variant="outline" className="text-xs">gramos</Badge>
        </div>
      )}


      {/* Description */}
      {food.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {food.description}
        </p>
      )}
    </Card>
  );
};

export default FoodSearchItem;