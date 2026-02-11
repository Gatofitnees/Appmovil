import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';
import { Plus, Minus, X, Star, Heart, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FoodLogEntry } from '@/hooks/useFoodLog';
import { EditableIngredient } from './EditableIngredient';
import { MacroEditModal } from './MacroEditModal';

interface Ingredient {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<FoodLogEntry>) => void;
  initialData?: Partial<FoodLogEntry>;
  imageUrl?: string;
}

export const FoodEditDialog: React.FC<FoodEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  imageUrl
}) => {
  const [formData, setFormData] = useState({
    custom_food_name: '',
    quantity_consumed: 1,
    unit_consumed: 'porción',
    calories_consumed: 0,
    protein_g_consumed: 0,
    carbs_g_consumed: 0,
    fat_g_consumed: 0,
    healthScore: 7,
    ingredients: [] as Ingredient[],
    notes: ''
  });

  const [editingIngredient, setEditingIngredient] = useState<{
    index: number;
    field: string;
    value: string | number;
  } | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        custom_food_name: initialData.custom_food_name || '',
        quantity_consumed: initialData.quantity_consumed || 1,
        unit_consumed: initialData.unit_consumed || 'porción',
        calories_consumed: initialData.calories_consumed || 0,
        protein_g_consumed: initialData.protein_g_consumed || 0,
        carbs_g_consumed: initialData.carbs_g_consumed || 0,
        fat_g_consumed: initialData.fat_g_consumed || 0,
        healthScore: initialData.health_score || 7,
        ingredients: initialData.ingredients || [],
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const recalculateTotals = (currentIngredients: Ingredient[]) => {
    if (currentIngredients.length === 0) return;

    const totals = currentIngredients.reduce((acc, ing) => ({
      calories: acc.calories + (ing.calories || 0),
      protein: acc.protein + (ing.protein || 0),
      carbs: acc.carbs + (ing.carbs || 0),
      fat: acc.fat + (ing.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setFormData(prev => ({
      ...prev,
      ingredients: currentIngredients,
      calories_consumed: Math.round(totals.calories),
      protein_g_consumed: parseFloat(totals.protein.toFixed(1)),
      carbs_g_consumed: parseFloat(totals.carbs.toFixed(1)),
      fat_g_consumed: parseFloat(totals.fat.toFixed(1))
    }));
  };

  const adjustPortion = (delta: number) => {
    const newQuantity = Math.max(0.5, formData.quantity_consumed + delta);
    const ratio = newQuantity / formData.quantity_consumed;

    // Scale ingredients
    const scaledIngredients = formData.ingredients.map(ing => ({
      ...ing,
      grams: Math.round(ing.grams * ratio),
      calories: Math.round(ing.calories * ratio),
      protein: parseFloat((ing.protein * ratio).toFixed(1)),
      carbs: parseFloat((ing.carbs * ratio).toFixed(1)),
      fat: parseFloat((ing.fat * ratio).toFixed(1))
    }));

    setFormData(prev => ({
      ...prev,
      quantity_consumed: newQuantity,
      ingredients: scaledIngredients,
      calories_consumed: Math.round(prev.calories_consumed * ratio),
      protein_g_consumed: parseFloat((prev.protein_g_consumed * ratio).toFixed(1)),
      carbs_g_consumed: parseFloat((prev.carbs_g_consumed * ratio).toFixed(1)),
      fat_g_consumed: parseFloat((prev.fat_g_consumed * ratio).toFixed(1))
    }));
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-400';
    if (score >= 4) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const addIngredient = () => {
    const newIngredients = [
      ...formData.ingredients,
      { name: 'Nuevo ingrediente', grams: 100, calories: 0, protein: 0, carbs: 0, fat: 0 }
    ];
    // No recalculamos totales al añadir, para no resetear lo que ya había si es 0
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  // Trigger editing modal
  const handleIngredientClick = (index: number, field: string, value: string | number) => {
    setEditingIngredient({ index, field, value });
  };

  // Handle update from modal
  const handleIngredientUpdate = (type: string, value: string | number) => {
    if (!editingIngredient) return;

    const newIngredients = [...formData.ingredients];
    const index = editingIngredient.index;
    const field = editingIngredient.field;

    // Use the field from state to ensure we update the correct property
    const finalValue = field === 'name' ? String(value) : Number(value);
    (newIngredients[index] as any)[field] = finalValue;

    recalculateTotals(newIngredients);
    setEditingIngredient(null);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    recalculateTotals(newIngredients);
  };

  const handleSave = () => {
    const saveData: Partial<FoodLogEntry> = {
      custom_food_name: formData.custom_food_name,
      quantity_consumed: formData.quantity_consumed,
      unit_consumed: formData.unit_consumed,
      calories_consumed: formData.calories_consumed,
      protein_g_consumed: formData.protein_g_consumed,
      carbs_g_consumed: formData.carbs_g_consumed,
      fat_g_consumed: formData.fat_g_consumed,
      health_score: formData.healthScore,
      ingredients: formData.ingredients,
      notes: formData.notes,
      meal_type: 'snack1' as const
    };

    if (imageUrl) {
      saveData.photo_url = imageUrl;
    }

    onSave(saveData);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-background border border-white/10 max-w-md mx-auto rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between pb-2">
            <DialogTitle className="text-lg font-medium">
              Editar Alimento
            </DialogTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-secondary/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image and Name Section */}
            <div className="flex gap-4">
              {imageUrl && (
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary/20">
                    <img
                      src={imageUrl}
                      alt="Food"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm font-medium">Nombre del alimento</label>
                  <Input
                    value={formData.custom_food_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_food_name: e.target.value }))}
                    placeholder="Nombre del alimento"
                    className="mt-1"
                  />
                </div>

                {/* Portion Controls */}
                <div>
                  <label className="text-sm font-medium">Cantidad</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustPortion(-0.5)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <span className="text-sm font-medium min-w-[60px] text-center">
                      {formData.quantity_consumed} {formData.unit_consumed}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustPortion(0.5)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div>
              <h3 className="text-sm font-medium mb-3">Macronutrientes</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Calorías</label>
                  <Input
                    type="number"
                    value={formData.calories_consumed}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories_consumed: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Proteínas (g)</label>
                  <Input
                    type="number"
                    value={formData.protein_g_consumed}
                    onChange={(e) => setFormData(prev => ({ ...prev, protein_g_consumed: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Carbohidratos (g)</label>
                  <Input
                    type="number"
                    value={formData.carbs_g_consumed}
                    onChange={(e) => setFormData(prev => ({ ...prev, carbs_g_consumed: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Grasas (g)</label>
                  <Input
                    type="number"
                    value={formData.fat_g_consumed}
                    onChange={(e) => setFormData(prev => ({ ...prev, fat_g_consumed: Number(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Health Score */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium">Puntaje de salud</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>

                <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      getHealthScoreColor(formData.healthScore)
                    )}
                    style={{ width: `${(formData.healthScore / 10) * 100}%` }}
                  />
                </div>

                <div className="text-center">
                  <span className="text-sm font-medium">{formData.healthScore}/10</span>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Ingredientes</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addIngredient}
                  className="h-7 px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <EditableIngredient
                        {...ingredient}
                        onClick={(field, value) => handleIngredientClick(index, field, value)}
                      />
                    </div>
                    {formData.ingredients.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeIngredient(index)}
                        className="h-10 w-10 p-0 self-center"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                leftIcon={<Star className="h-4 w-4" />}
              >
                Cambiar resultados
              </Button>

              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSave}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <MacroEditModal
        editingMacro={editingIngredient?.field ?? null}
        currentValue={editingIngredient?.value ?? 0}
        onClose={() => setEditingIngredient(null)}
        onUpdate={handleIngredientUpdate}
      />
    </>
  );
};
