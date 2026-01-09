import { useState, useEffect, useCallback } from 'react';
import { useAdminNutritionProgram, AdminNutritionIngredient } from './useAdminNutritionProgram';
import { useFoodLog } from './useFoodLog';
import { useToast } from './use-toast';
import { FoodLogEntry } from '@/types/foodLog';
import { useNavigate } from 'react-router-dom';

export const useNutritionProgramPage = (selectedDate: Date) => {
  const navigate = useNavigate();
  const { nutritionPlan, loading } = useAdminNutritionProgram(selectedDate);
  const { addEntry } = useFoodLog(selectedDate.toISOString().split('T')[0]);
  const { toast } = useToast();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Reset initialization when date changes
  useEffect(() => {
    setInitialized(false);
    setSelectedOptions({});
    setCheckedIngredients({});
    setIngredientQuantities({});
    setShowSaveModal(false);
  }, [selectedDate.toDateString()]);

  // Initialize selected options and quantities when nutrition plan loads (only once per plan)
  useEffect(() => {
    if (nutritionPlan?.meals && !initialized) {
      const initialOptions: Record<string, number> = {};
      const initialQuantities: Record<string, number> = {};

      nutritionPlan.meals.forEach(meal => {
        if (meal.options && meal.options.length > 0) {
          initialOptions[meal.id] = 0; // Select first option by default

          // Only initialize quantities for the selected option (first option by default)
          const selectedOption = meal.options[0];
          selectedOption.ingredients?.forEach(ingredient => {
            initialQuantities[ingredient.id] = ingredient.quantity_grams;
          });
        }
      });

      setSelectedOptions(initialOptions);
      setIngredientQuantities(initialQuantities);
      setInitialized(true);
    }
  }, [nutritionPlan?.id, initialized]); // Only depend on plan ID, not the whole object

  const handleOptionSelect = useCallback((mealId: string, optionIndex: number) => {
    if (!nutritionPlan?.meals) return;

    const meal = nutritionPlan.meals.find(m => m.id === mealId);
    if (!meal?.options) return;

    const selectedOption = meal.options[optionIndex];
    if (!selectedOption) return;

    // Perform all state updates atomically
    setSelectedOptions(prev => ({
      ...prev,
      [mealId]: optionIndex
    }));

    setCheckedIngredients(prev => {
      const newChecked = { ...prev };
      // Clear all ingredients for this meal
      meal.options.forEach(option => {
        option.ingredients?.forEach(ingredient => {
          delete newChecked[ingredient.id];
        });
      });
      return newChecked;
    });

    setIngredientQuantities(prev => {
      const newQuantities = { ...prev };

      // Clear all ingredient quantities for this meal
      meal.options.forEach(option => {
        option.ingredients?.forEach(ingredient => {
          delete newQuantities[ingredient.id];
        });
      });

      // Set quantities for the newly selected option
      selectedOption.ingredients?.forEach(ingredient => {
        newQuantities[ingredient.id] = ingredient.quantity_grams;
      });

      return newQuantities;
    });
  }, [nutritionPlan]);

  const handleIngredientCheck = useCallback((ingredientId: string, checked: boolean) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [ingredientId]: checked
    }));
  }, []);

  const handleQuantityChange = useCallback((ingredientId: string, quantity: number) => {
    setIngredientQuantities(prev => ({
      ...prev,
      [ingredientId]: quantity
    }));
  }, []);

  const convertIngredientToFoodLogEntry = (ingredient: AdminNutritionIngredient, quantity: number, customName?: string): Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'> => {
    // Calculate scaled macros based on quantity
    const scale = quantity / ingredient.quantity_grams;

    // Get the appropriate food name, with custom name override
    const foodName = customName ||
      ingredient.custom_food_name ||
      ingredient.food_items?.name ||
      ingredient.recipe_name ||
      'Alimento del plan nutricional';

    return {
      food_item_id: ingredient.food_items?.id || null,
      meal_type: 'breakfast', // Default to breakfast, can be improved to detect from meal context
      custom_food_name: foodName,
      quantity_consumed: quantity,
      unit_consumed: 'g',
      calories_consumed: ingredient.calories_per_serving * scale,
      protein_g_consumed: ingredient.protein_g_per_serving * scale,
      carbs_g_consumed: ingredient.carbs_g_per_serving * scale,
      fat_g_consumed: ingredient.fats_g_per_serving * scale,
      health_score: null,
      ingredients: null,
      notes: 'Agregado desde plan nutricional programado',
      photo_url: null
    };
  };

  const handleSaveMeals = useCallback(async (specificIngredients?: AdminNutritionIngredient[], customName?: string) => {
    if (!nutritionPlan?.meals) return;

    setSaving(true);
    let savedCount = 0;
    let errorCount = 0;

    // Check if saving for a different date
    const isToday = selectedDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
    const dateDisplay = selectedDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });

    try {
      // Collect ingredients to save (either specific ones or all checked ones)
      const ingredientsToSave: { ingredient: AdminNutritionIngredient; quantity: number }[] = [];

      if (specificIngredients) {
        // Save only the specific ingredients passed (for recipe save)
        specificIngredients.forEach(ingredient => {
          if (checkedIngredients[ingredient.id]) {
            const quantity = ingredientQuantities[ingredient.id] || ingredient.quantity_grams;
            ingredientsToSave.push({ ingredient, quantity });
          }
        });
      } else {
        // Collect all checked ingredients (for main save button)
        nutritionPlan.meals.forEach(meal => {
          const selectedOptionIndex = selectedOptions[meal.id] || 0;
          const selectedOption = meal.options?.[selectedOptionIndex];

          if (selectedOption?.ingredients) {
            selectedOption.ingredients.forEach(ingredient => {
              if (checkedIngredients[ingredient.id]) {
                const quantity = ingredientQuantities[ingredient.id] || ingredient.quantity_grams;
                ingredientsToSave.push({ ingredient, quantity });
              }
            });
          }
        });
      }

      if (ingredientsToSave.length === 0) {
        toast({
          title: "Sin ingredientes seleccionados",
          description: "Selecciona al menos un ingrediente para guardar.",
          variant: "destructive"
        });
        return;
      }

      // Save each ingredient as a food log entry
      for (const { ingredient, quantity } of ingredientsToSave) {
        try {
          const foodLogEntry = convertIngredientToFoodLogEntry(ingredient, quantity, customName);
          const result = await addEntry(foodLogEntry);

          if (result) {
            savedCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error('Error saving ingredient:', error);
          errorCount++;
        }
      }

      if (savedCount > 0) {
        toast({
          title: "Comidas guardadas",
          description: `Se guardaron ${savedCount} alimento${savedCount > 1 ? 's' : ''} en ${isToday ? 'tu registro de hoy' : dateDisplay}.`,
          variant: "default"
        });

        // Clear selections for saved ingredients
        if (specificIngredients) {
          const newCheckedIngredients = { ...checkedIngredients };
          specificIngredients.forEach(ingredient => {
            delete newCheckedIngredients[ingredient.id];
          });
          setCheckedIngredients(newCheckedIngredients);
        } else {
          // Clear all selections after successful save
          setCheckedIngredients({});
          // Navigate back to nutrition page only for main save
          navigate('/nutrition');
        }
      }

      if (errorCount > 0) {
        toast({
          title: "Algunos alimentos no se pudieron guardar",
          description: `${errorCount} alimento${errorCount > 1 ? 's no se pudieron' : ' no se pudo'} guardar.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error saving meals:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar las comidas. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [nutritionPlan, selectedOptions, checkedIngredients, ingredientQuantities, addEntry, toast, navigate]);

  const handleOpenSaveModal = useCallback(() => {
    if (!nutritionPlan?.meals) return;

    // Check if there are selected ingredients
    const hasSelected = nutritionPlan.meals.some(meal => {
      const selectedOptionIndex = selectedOptions[meal.id] || 0;
      const selectedOption = meal.options?.[selectedOptionIndex];
      return selectedOption?.ingredients?.some(ingredient => checkedIngredients[ingredient.id]);
    });

    if (!hasSelected) {
      toast({
        title: "Sin ingredientes seleccionados",
        description: "Selecciona al menos un ingrediente para guardar.",
        variant: "destructive"
      });
      return;
    }

    setShowSaveModal(true);
  }, [nutritionPlan, selectedOptions, checkedIngredients, toast]);

  const handleSaveWithName = useCallback(async (customName?: string) => {
    setShowSaveModal(false);

    if (!nutritionPlan?.meals) return;

    setSaving(true);

    // Check if saving for a different date
    const isToday = selectedDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
    const dateDisplay = selectedDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });

    try {
      // Collect all checked ingredients
      const ingredientsToSave: { ingredient: AdminNutritionIngredient; quantity: number }[] = [];

      nutritionPlan.meals.forEach(meal => {
        const selectedOptionIndex = selectedOptions[meal.id] || 0;
        const selectedOption = meal.options?.[selectedOptionIndex];

        if (selectedOption?.ingredients) {
          selectedOption.ingredients.forEach(ingredient => {
            if (checkedIngredients[ingredient.id]) {
              const quantity = ingredientQuantities[ingredient.id] || ingredient.quantity_grams;
              ingredientsToSave.push({ ingredient, quantity });
            }
          });
        }
      });

      if (ingredientsToSave.length === 0) {
        toast({
          title: "Sin ingredientes seleccionados",
          description: "Selecciona al menos un ingrediente para guardar.",
          variant: "destructive"
        });
        return;
      }

      // Create composite meal entry
      const mealName = customName || 'Comida del plan nutricional';
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalQuantity = 0;

      const ingredients: any[] = [];
      const ingredientsList: string[] = [];

      for (const { ingredient, quantity } of ingredientsToSave) {
        const scale = quantity / ingredient.quantity_grams;

        totalCalories += ingredient.calories_per_serving * scale;
        totalProtein += ingredient.protein_g_per_serving * scale;
        totalCarbs += ingredient.carbs_g_per_serving * scale;
        totalFat += ingredient.fats_g_per_serving * scale;
        totalQuantity += quantity;

        const ingredientName = ingredient.custom_food_name ||
          ingredient.food_items?.name ||
          ingredient.recipe_name ||
          'Ingrediente del plan';

        ingredients.push({
          name: ingredientName,
          grams: quantity,
          calories: ingredient.calories_per_serving * scale,
          protein: ingredient.protein_g_per_serving * scale,
          carbs: ingredient.carbs_g_per_serving * scale,
          fat: ingredient.fats_g_per_serving * scale
        });
        ingredientsList.push(`${ingredientName} (${quantity}g)`);
      }

      // Save as single composite meal
      const result = await addEntry({
        food_item_id: null,
        meal_type: 'breakfast',
        custom_food_name: mealName,
        quantity_consumed: totalQuantity,
        unit_consumed: 'g',
        calories_consumed: totalCalories,
        protein_g_consumed: totalProtein,
        carbs_g_consumed: totalCarbs,
        fat_g_consumed: totalFat,
        health_score: null,
        ingredients: ingredients,
        notes: `Comida del plan nutricional: ${ingredientsList.join(', ')}`,
        photo_url: null
      });

      if (result) {
        toast({
          title: "¡Comida guardada!",
          description: `${mealName} se ha guardado en ${isToday ? 'tu registro de hoy' : dateDisplay} con ${ingredientsToSave.length} ingredientes`,
        });

        // Clear all selections after successful save
        setCheckedIngredients({});
        // Navigate back to nutrition page
        navigate('/nutrition');
      } else {
        throw new Error('No se pudo guardar la comida');
      }

    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar la comida. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [handleSaveMeals]);

  const getSelectedIngredients = useCallback(() => {
    if (!nutritionPlan?.meals) return [];

    const selectedIngredients: AdminNutritionIngredient[] = [];

    nutritionPlan.meals.forEach(meal => {
      const selectedOptionIndex = selectedOptions[meal.id] || 0;
      const selectedOption = meal.options?.[selectedOptionIndex];

      if (selectedOption?.ingredients) {
        selectedOption.ingredients.forEach(ingredient => {
          if (checkedIngredients[ingredient.id]) {
            selectedIngredients.push(ingredient);
          }
        });
      }
    });

    return selectedIngredients;
  }, [nutritionPlan, selectedOptions, checkedIngredients]);

  return {
    nutritionPlan,
    selectedOptions,
    checkedIngredients,
    ingredientQuantities,
    loading,
    saving,
    showSaveModal,
    handleOptionSelect,
    handleIngredientCheck,
    handleQuantityChange,
    handleSaveMeals,
    handleOpenSaveModal,
    handleSaveWithName,
    setShowSaveModal,
    getSelectedIngredients
  };
};