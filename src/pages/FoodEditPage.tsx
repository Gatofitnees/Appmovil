import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FoodLogEntry, useFoodLog } from '@/hooks/useFoodLog';
import { FoodHeader } from '@/components/nutrition/FoodHeader';
import { FoodNameAndPortion } from '@/components/nutrition/FoodNameAndPortion';
import { CaloriesDisplay } from '@/components/nutrition/CaloriesDisplay';
import { MacronutrientsGrid } from '@/components/nutrition/MacronutrientsGrid';
import { HealthScoreCard } from '@/components/nutrition/HealthScoreCard';
import { IngredientsSection } from '@/components/nutrition/IngredientsSection';
import { ActionButtons } from '@/components/nutrition/ActionButtons';
import { MacroEditModal } from '@/components/nutrition/MacroEditModal';
import { ChangeResultsDialog } from '@/components/nutrition/ChangeResultsDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FoodEditPageProps {
  onSave?: (entry: Partial<FoodLogEntry>) => void;
}

export const FoodEditPage: React.FC<FoodEditPageProps> = ({ onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialData, imageUrl, isEditing, hasAnalysisError } = location.state || {};
  const { addEntry, updateEntry } = useFoodLog();

  const [formData, setFormData] = useState({
    custom_food_name: '',
    quantity_consumed: 1,
    unit_consumed: 'porción',
    calories_consumed: 0,
    protein_g_consumed: 0,
    carbs_g_consumed: 0,
    fat_g_consumed: 0,
    healthScore: 7
  });

  const [editingIngredient, setEditingIngredient] = useState<{
    index: number;
    field: string;
    value: string | number;
  } | null>(null);

  const [editingMacro, setEditingMacro] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [showChangeResults, setShowChangeResults] = useState(false);
  const [ingredients, setIngredients] = useState([
    { name: 'Pechuga de pollo', grams: 150, calories: 248, protein: 46, carbs: 0, fat: 5 },
    { name: 'Arroz integral', grams: 100, calories: 111, protein: 3, carbs: 23, fat: 1 },
    { name: 'Verduras mixtas', grams: 80, calories: 20, protein: 2, carbs: 4, fat: 0 }
  ]);

  useEffect(() => {
    if (initialData) {
      console.log('Loading initial data:', initialData);

      setFormData({
        custom_food_name: initialData.custom_food_name || '',
        quantity_consumed: initialData.quantity_consumed || 1,
        unit_consumed: initialData.unit_consumed || 'porción',
        calories_consumed: initialData.calories_consumed || 0,
        protein_g_consumed: initialData.protein_g_consumed || 0,
        carbs_g_consumed: initialData.carbs_g_consumed || 0,
        fat_g_consumed: initialData.fat_g_consumed || 0,
        healthScore: initialData.healthScore || initialData.health_score || 7
      });

      // Update ingredients from database or webhook analysis
      if (initialData.ingredients && initialData.ingredients.length > 0) {
        console.log('Loading ingredients from data:', initialData.ingredients);
        setIngredients(initialData.ingredients);
        setShowIngredients(true);
      }
    }
  }, [initialData]);

  const recalculateTotals = (currentIngredients: any[]) => {
    if (currentIngredients.length === 0) return;

    const totals = currentIngredients.reduce((acc, ing) => ({
      calories: acc.calories + (ing.calories || 0),
      protein: acc.protein + (ing.protein || 0),
      carbs: acc.carbs + (ing.carbs || 0),
      fat: acc.fat + (ing.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setFormData(prev => ({
      ...prev,
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
    const scaledIngredients = ingredients.map(ing => ({
      ...ing,
      grams: Math.round(ing.grams * ratio),
      calories: Math.round(ing.calories * ratio),
      protein: parseFloat((ing.protein * ratio).toFixed(1)),
      carbs: parseFloat((ing.carbs * ratio).toFixed(1)),
      fat: parseFloat((ing.fat * ratio).toFixed(1))
    }));

    setIngredients(scaledIngredients);

    setFormData(prev => ({
      ...prev,
      quantity_consumed: newQuantity,
      calories_consumed: Math.round(prev.calories_consumed * ratio),
      protein_g_consumed: parseFloat((prev.protein_g_consumed * ratio).toFixed(1)),
      carbs_g_consumed: parseFloat((prev.carbs_g_consumed * ratio).toFixed(1)),
      fat_g_consumed: parseFloat((prev.fat_g_consumed * ratio).toFixed(1))
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const saveData: Partial<FoodLogEntry> = {
        custom_food_name: formData.custom_food_name,
        quantity_consumed: formData.quantity_consumed,
        unit_consumed: formData.unit_consumed,
        calories_consumed: formData.calories_consumed,
        protein_g_consumed: formData.protein_g_consumed,
        carbs_g_consumed: formData.carbs_g_consumed,
        fat_g_consumed: formData.fat_g_consumed,
        health_score: formData.healthScore,
        ingredients: ingredients,
        meal_type: 'snack1' as const
      };

      if (imageUrl) {
        saveData.photo_url = imageUrl;
      }

      console.log('Saving food data:', saveData);

      let success = false;

      if (isEditing && initialData?.id) {
        success = await updateEntry(initialData.id, saveData);
      } else {
        const result = await addEntry(saveData as Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>);
        success = result !== null;
      }

      if (success) {
        console.log('Food entry saved successfully');
        if (onSave) {
          onSave(saveData);
        }
        navigate('/nutrition');
      } else {
        console.error('Failed to save food entry');
      }
    } catch (error) {
      console.error('Error saving food entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateMacro = (type: string, value: string | number) => {
    // Helper to calc calories from macros
    const calculateCalories = (p: number, c: number, f: number) => Math.round((p * 4) + (c * 4) + (f * 9));

    // If editing an ingredient
    if (editingIngredient) {
      const newIngredients = [...ingredients];
      const index = editingIngredient.index;
      const field = editingIngredient.field; // Use the stored field directly

      const finalValue = field === 'name' ? String(value) : Number(value);
      (newIngredients[index] as any)[field] = finalValue;

      // If we updated a macro field, recalculate ingredient calories
      if (['protein', 'carbs', 'fat'].includes(field)) {
        const ing = newIngredients[index];
        // Ensure we treat them as numbers (they might be strings from modal if not careful, but we cast finalValue above)
        // But we should also read other fields safely
        const p = field === 'protein' ? Number(finalValue) : (ing.protein || 0);
        const c = field === 'carbs' ? Number(finalValue) : (ing.carbs || 0);
        const f = field === 'fat' ? Number(finalValue) : (ing.fat || 0);

        ing.calories = calculateCalories(p, c, f);
      }

      setIngredients(newIngredients);
      recalculateTotals(newIngredients);
      setEditingIngredient(null);
    } else {
      // Logic for editing top-level macros 
      const numValue = Number(value);
      setFormData(prev => {
        const newData = { ...prev, [`${type}_consumed`]: numValue };

        // If updating a macro (stripping _consumed suffix to check type)
        const baseType = type.replace('_consumed', '');
        if (['protein_g', 'carbs_g', 'fat_g'].includes(type) || ['protein', 'carbs', 'fat'].includes(baseType)) {
          // We need current values for others
          const p = type === 'protein_g_consumed' ? numValue : prev.protein_g_consumed;
          const c = type === 'carbs_g_consumed' ? numValue : prev.carbs_g_consumed;
          const f = type === 'fat_g_consumed' ? numValue : prev.fat_g_consumed;

          newData.calories_consumed = calculateCalories(p, c, f);
        }
        return newData;
      });
    }
  };

  const handleFoodDataUpdate = (updatedData: any) => {
    console.log('Updating food data from AI response:', updatedData);

    // Update form data with the new values
    setFormData(prev => ({
      ...prev,
      custom_food_name: updatedData.custom_food_name,
      quantity_consumed: updatedData.quantity_consumed,
      unit_consumed: updatedData.unit_consumed,
      calories_consumed: updatedData.calories_consumed,
      protein_g_consumed: updatedData.protein_g_consumed,
      carbs_g_consumed: updatedData.carbs_g_consumed,
      fat_g_consumed: updatedData.fat_g_consumed,
      healthScore: updatedData.healthScore
    }));

    // Update ingredients
    if (updatedData.ingredients && updatedData.ingredients.length > 0) {
      setIngredients(updatedData.ingredients);
      setShowIngredients(true);
    }

    console.log('Food data updated successfully');
  };

  const handleIngredientClick = (index: number, field: string, value: string | number) => {
    setEditingIngredient({ index, field, value });
  };

  // Create the food data object with all current state including ingredients
  const currentFoodData = {
    custom_food_name: formData.custom_food_name,
    quantity_consumed: formData.quantity_consumed,
    unit_consumed: formData.unit_consumed,
    calories_consumed: formData.calories_consumed,
    protein_g_consumed: formData.protein_g_consumed,
    carbs_g_consumed: formData.carbs_g_consumed,
    fat_g_consumed: formData.fat_g_consumed,
    healthScore: formData.healthScore,
    ingredients: ingredients
  };

  return (
    <div className="min-h-screen bg-background">
      <FoodHeader imageUrl={imageUrl} />

      <div className="px-4 -mt-8 relative z-10">
        {/* Analysis Error Alert */}
        {hasAnalysisError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ¡Hey eso no se come! Parece que no se a detectado ninguna comida
            </AlertDescription>
          </Alert>
        )}

        <FoodNameAndPortion
          foodName={formData.custom_food_name}
          quantity={formData.quantity_consumed}
          onFoodNameChange={(name) => setFormData(prev => ({ ...prev, custom_food_name: name }))}
          onQuantityChange={adjustPortion}
        />

        <CaloriesDisplay calories={formData.calories_consumed} />

        <MacronutrientsGrid
          protein={formData.protein_g_consumed}
          carbs={formData.carbs_g_consumed}
          fat={formData.fat_g_consumed}
          onMacroEdit={setEditingMacro}
        />

        <HealthScoreCard healthScore={formData.healthScore} />

        <IngredientsSection
          ingredients={ingredients}
          showIngredients={showIngredients}
          onToggleShow={() => setShowIngredients(!showIngredients)}
          onIngredientClick={handleIngredientClick}
        />

        <ActionButtons
          isSaving={isSaving}
          isFormValid={!!formData.custom_food_name.trim()}
          onChangeResults={() => setShowChangeResults(true)}
          onSave={handleSave}
        />
      </div>

      <MacroEditModal
        editingMacro={editingIngredient ? editingIngredient.field : editingMacro}
        currentValue={editingIngredient ? editingIngredient.value : (editingMacro ? formData[editingMacro as keyof typeof formData] as number : 0)}
        onClose={() => {
          setEditingMacro(null);
          setEditingIngredient(null);
        }}
        onUpdate={updateMacro}
      />

      <ChangeResultsDialog
        isOpen={showChangeResults}
        onClose={() => setShowChangeResults(false)}
        onSubmit={() => { }}
        onUpdate={handleFoodDataUpdate}
        foodData={currentFoodData}
      />
    </div>
  );
};

export default FoodEditPage;
