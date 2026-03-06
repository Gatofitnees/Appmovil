import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NumericInput } from '@/components/ui/numeric-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check } from 'lucide-react';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PortionSelectorProps {
  food: {
    id: string;
    name: string;
    description: string;
    brand?: string;
    nutrition?: {
      calories: number;
      fat: number;
      carbs: number;
      protein: number;
      serving_size: string;
    };
  };
  onCancel: () => void;
  onConfirm: () => void;
  selectedDate?: string;
}

const PortionSelector: React.FC<PortionSelectorProps> = ({
  food,
  onCancel,
  onConfirm,
  selectedDate
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addEntry } = useFoodLog(selectedDate);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('gramos');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2'>('lunch');

  const handleAddToLog = async () => {
    if (!food.nutrition) {
      toast({
        title: "Error",
        description: "No hay información nutricional disponible",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseFloat(quantity) || 100;
    const multiplier = quantityNum / 100; // FatSecret data is per 100g

    try {
      await addEntry({
        custom_food_name: `${food.name}${food.brand ? ` (${food.brand})` : ''}`,
        quantity_consumed: quantityNum,
        unit_consumed: unit,
        calories_consumed: food.nutrition.calories * multiplier,
        protein_g_consumed: food.nutrition.protein * multiplier,
        carbs_g_consumed: food.nutrition.carbs * multiplier,
        fat_g_consumed: food.nutrition.fat * multiplier,
        meal_type: mealType,
        notes: `Agregado desde FatSecret: ${food.description}`,
      });

      toast({
        title: "¡Comida agregada!",
        description: `${food.name} se ha agregado a tu registro`,
      });

      navigate('/nutrition');
    } catch (error) {
      console.error('Error adding food:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la comida al registro",
        variant: "destructive",
      });
    }
  };

  const nutrition = food.nutrition;
  const quantityNum = parseFloat(quantity) || 100;
  const multiplier = quantityNum / 100;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm leading-tight">{food.name}</h3>
          {food.brand && (
            <p className="text-xs text-muted-foreground">{food.brand}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="quantity">Cantidad</Label>
            <NumericInput
              id="quantity"
              allowDecimals
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="unit">Unidad</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gramos">Gramos</SelectItem>
                <SelectItem value="onzas">Onzas</SelectItem>
                <SelectItem value="tazas">Tazas</SelectItem>
                <SelectItem value="porciones">Porciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="meal-type">Tipo de comida</Label>
          <Select value={mealType} onValueChange={(value: any) => setMealType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Desayuno</SelectItem>
              <SelectItem value="lunch">Almuerzo</SelectItem>
              <SelectItem value="dinner">Cena</SelectItem>
              <SelectItem value="snack1">Merienda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {nutrition && (
          <div className="bg-muted rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">Información Nutricional</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Calorías:</span>
                <span className="font-medium">{Math.round(nutrition.calories * multiplier)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Proteína:</span>
                <span className="font-medium">{(nutrition.protein * multiplier).toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span>Carbohidratos:</span>
                <span className="font-medium">{(nutrition.carbs * multiplier).toFixed(1)}g</span>
              </div>
              <div className="flex justify-between">
                <span>Grasa:</span>
                <span className="font-medium">{(nutrition.fat * multiplier).toFixed(1)}g</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleAddToLog}
          className="w-full"
          disabled={!nutrition}
        >
          <Check className="w-4 h-4 mr-2" />
          Agregar al registro
        </Button>
      </div>
    </Card>
  );
};

export default PortionSelector;