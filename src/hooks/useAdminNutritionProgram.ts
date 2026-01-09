import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminNutritionPlan {
  id: string;
  name: string;
  description?: string;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fats_g: number;
  duration_days?: number;
  difficulty_level?: string;
  meals?: AdminNutritionMeal[];
}

export interface AdminNutritionMeal {
  id: string;
  meal_name: string;
  meal_type: string;
  target_calories?: number;
  target_protein_g?: number;
  target_carbs_g?: number;
  target_fats_g?: number;
  meal_order: number;
  options?: AdminNutritionMealOption[];
}

export interface AdminNutritionMealOption {
  id: string;
  option_name: string;
  description?: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fats_g: number;
  option_order?: number;
  meal_id?: string;
  ingredients?: AdminNutritionIngredient[]; // Opcional - se carga lazy
}

export interface AdminNutritionIngredient {
  id: string;
  custom_food_name?: string;
  quantity_grams: number;
  calories_per_serving: number;
  protein_g_per_serving: number;
  carbs_g_per_serving: number;
  fats_g_per_serving: number;
  fiber_g_per_serving: number;
  recipe_id?: string;
  recipe_name?: string;
  recipe_description?: string;
  recipe_instructions?: string;
  recipe_image_url?: string;
  food_items?: {
    id: number;
    name: string;
  };
}

export const useAdminNutritionProgram = (selectedDate: Date) => {
  const { toast } = useToast();
  const [nutritionPlan, setNutritionPlan] = useState<AdminNutritionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasNutritionPlan, setHasNutritionPlan] = useState(false);
  const [lastFetchedDate, setLastFetchedDate] = useState<string | null>(null);

  const fetchAdminNutritionPlan = useCallback(async (dateToFetch: Date) => {
    // Ensure we're working with the correct date by normalizing to UTC
    const normalizedDate = new Date(dateToFetch.getFullYear(), dateToFetch.getMonth(), dateToFetch.getDate());
    const dateString = normalizedDate.toISOString().split('T')[0];

    // Avoid refetching if we already have data for this date
    if (lastFetchedDate === dateString && (nutritionPlan || hasNutritionPlan === false)) {
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        return;
      }

      // 0. Check for specific scheduled nutrition task for this date (Priority High)
      const { data: scheduledTasks } = await supabase
        .from('user_scheduled_tasks' as any)
        .select('nutrition_plan_id')
        .eq('user_id', user.id)
        .eq('scheduled_date', dateString)
        .eq('task_type', 'nutrition')
        .not('nutrition_plan_id', 'is', null)
        .limit(1);

      let targetNutritionPlanId: string | null = null;
      let targetNutritionProgramId: string | null = null;

      if (scheduledTasks && scheduledTasks.length > 0) {
        targetNutritionPlanId = scheduledTasks[0].nutrition_plan_id;
        console.log('Found scheduled nutrition task:', targetNutritionPlanId);
      } else {
        // 1. If no specific task, check for active admin program (Priority Medium)
        const { data: adminPrograms, error: adminError } = await supabase
          .from('user_assigned_programs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1);

        if (adminError) throw adminError;

        if (adminPrograms && adminPrograms.length > 0) {
          const adminAssignment = adminPrograms[0];
          targetNutritionProgramId = adminAssignment.program_id;

          // Calculate program day
          const startDate = new Date(adminAssignment.started_at);
          const startDateNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const daysDiff = Math.floor((normalizedDate.getTime() - startDateNormalized.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff >= 0) {
            const weekNumber = Math.floor(daysDiff / 7) + 1;
            const jsDay = normalizedDate.getDay();
            const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

            // Find plan for this specific day in the program
            const { data: nutritionPlanData, error: nutritionError } = await supabase
              .from('admin_program_nutrition_plans')
              .select('nutrition_plan_id')
              .eq('program_id', targetNutritionProgramId)
              .eq('week_number', weekNumber)
              .eq('day_of_week', dayOfWeek)
              .limit(1);

            if (nutritionError) throw nutritionError;

            if (nutritionPlanData && nutritionPlanData.length > 0) {
              targetNutritionPlanId = nutritionPlanData[0].nutrition_plan_id;
            }
          }
        }
      }

      if (!targetNutritionPlanId) {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
        setLastFetchedDate(dateString);
        return;
      }

      // Fetch the actual nutrition plan details (common for both paths)
      const { data: planDetails, error: planError } = await supabase
        .from('nutrition_plans')
        .select(`
            *,
            meals:nutrition_plan_meals (
              *,
              options:nutrition_plan_meal_options (
                id,
                option_name,
                description,
                total_calories,
                total_protein_g,
                total_carbs_g,
                total_fats_g,
                option_order,
                meal_id
              )
            )
          `)
        .eq('id', targetNutritionPlanId)
        .limit(1);

      if (planError) throw planError;

      if (planDetails && planDetails.length > 0) {
        const planData = planDetails[0];

        // Only sort meals and options, DO NOT load ingredients yet (lazy load)
        if (planData.meals) {
          planData.meals.sort((a, b) => (a.meal_order || 0) - (b.meal_order || 0));

          for (const meal of planData.meals) {
            if (meal.options) {
              meal.options.sort((a, b) => (a.option_order || 0) - (b.option_order || 0));
              // Initialize ingredients as undefined for later lazy loading
              meal.options.forEach((option: any) => {
                option.ingredients = undefined;
              });
            }
          }
        }

        setNutritionPlan(planData as any);
        setHasNutritionPlan(true);
      } else {
        setNutritionPlan(null);
        setHasNutritionPlan(false);
      }
      setLastFetchedDate(dateString);
      return;

      // The previous logic below is now superseded by the unified logic above, so we truncate the rest of the old block here.


    } catch (error: any) {
      console.error("Error fetching admin nutrition plan:", error);
      setNutritionPlan(null);
      setHasNutritionPlan(false);
      setLastFetchedDate(dateString);
    } finally {
      setLoading(false);
    }
  }, []);

  // Nueva función para cargar ingredientes de una opción específica
  const loadOptionIngredients = async (optionId: string): Promise<AdminNutritionIngredient[]> => {
    try {
      const { data: ingredients, error } = await supabase
        .from('nutrition_plan_meal_ingredients')
        .select(`
          *,
          food_items (
            id,
            name
          )
        `)
        .eq('meal_option_id', optionId)
        .order('ingredient_order');

      if (error) throw error;

      if (!ingredients || ingredients.length === 0) {
        return [];
      }

      // Obtener IDs únicos de recetas
      const recipeIds = [...new Set(
        ingredients
          .filter(ing => ing.recipe_id)
          .map(ing => ing.recipe_id)
      )];

      let enrichedIngredients: any[] = [];

      if (recipeIds.length > 0) {
        // Cargar información de recetas
        const { data: recipesData } = await supabase
          .from('recipes')
          .select('id, name, description, instructions, cover_image_url')
          .in('id', recipeIds);

        // Cargar ingredientes de recetas
        const { data: recipeIngredientsData } = await supabase
          .from('recipe_ingredients')
          .select(`
            *,
            food_items (
              id,
              name,
              calories_per_serving,
              protein_g_per_serving,
              carbs_g_per_serving,
              fat_g_per_serving,
              fiber_g_per_serving
            )
          `)
          .in('recipe_id', recipeIds);

        // Procesar ingredientes
        ingredients.forEach((ingredient: any) => {
          if (ingredient.recipe_id && recipesData && recipeIngredientsData) {
            const recipeData = recipesData.find(r => r.id === ingredient.recipe_id);
            const recipeIngredients = recipeIngredientsData.filter(ri => ri.recipe_id === ingredient.recipe_id);

            if (recipeData && recipeIngredients.length > 0) {
              recipeIngredients.forEach((recipeIngredient: any) => {
                const foodItem = recipeIngredient.food_items;
                if (foodItem) {
                  const servingRatio = recipeIngredient.quantity_grams / 100;

                  enrichedIngredients.push({
                    id: `${ingredient.id}_${recipeIngredient.id}`,
                    custom_food_name: recipeIngredient.custom_name || foodItem.name,
                    quantity_grams: recipeIngredient.quantity_grams,
                    calories_per_serving: (foodItem.calories_per_serving || 0) * servingRatio,
                    protein_g_per_serving: (foodItem.protein_g_per_serving || 0) * servingRatio,
                    carbs_g_per_serving: (foodItem.carbs_g_per_serving || 0) * servingRatio,
                    fats_g_per_serving: (foodItem.fat_g_per_serving || 0) * servingRatio,
                    fiber_g_per_serving: (foodItem.fiber_g_per_serving || 0) * servingRatio,
                    recipe_id: ingredient.recipe_id,
                    recipe_name: recipeData.name,
                    recipe_description: recipeData.description,
                    recipe_instructions: recipeData.instructions,
                    recipe_image_url: recipeData.cover_image_url,
                    food_items: {
                      id: foodItem.id,
                      name: foodItem.name
                    }
                  });
                }
              });
            }
          } else {
            enrichedIngredients.push(ingredient);
          }
        });
      } else {
        enrichedIngredients = ingredients;
      }

      return enrichedIngredients as AdminNutritionIngredient[];
    } catch (error) {
      console.error('Error loading option ingredients:', error);
      return [];
    }
  };

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    if (lastFetchedDate !== dateString) {
      fetchAdminNutritionPlan(selectedDate);
    }
  }, [selectedDate.toISOString().split('T')[0], fetchAdminNutritionPlan]);

  return {
    nutritionPlan,
    loading,
    hasNutritionPlan,
    refetch: () => fetchAdminNutritionPlan(selectedDate),
    loadOptionIngredients
  };
};