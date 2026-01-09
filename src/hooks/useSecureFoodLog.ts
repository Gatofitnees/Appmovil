
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { validateWebhookResponse, RateLimiter } from '@/utils/securityValidation';
import { sanitizeFoodName, validateCalories, validateMacronutrient } from '@/utils/validation';
import { FoodLogEntry } from './useFoodLog';
import { useStreaks } from './useStreaks';

// Rate limiter for food entries (max 20 entries per minute)
const foodEntryLimiter = new RateLimiter(20, 60000);

export const useSecureFoodLog = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const streak = useStreaks();

  const secureAddEntry = async (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>): Promise<FoodLogEntry | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive"
      });
      return null;
    }

    // Rate limiting
    if (!foodEntryLimiter.isAllowed(user.id)) {
      toast({
        title: "Error",
        description: "Demasiadas entradas de comida. Espera un momento antes de intentar de nuevo.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      // Enhanced validation
      const validation = validateWebhookResponse(entry);
      if (!validation.isValid) {
        toast({
          title: "Error",
          description: validation.error || "Datos de entrada inválidos",
          variant: "destructive"
        });
        return null;
      }

      // Extra sanitization and validation
      const sanitizedEntry = {
        ...entry,
        custom_food_name: sanitizeFoodName(entry.custom_food_name).substring(0, 100),
        unit_consumed: sanitizeFoodName(entry.unit_consumed || '').substring(0, 50),
        quantity_consumed: Math.max(0, Math.min(validateMacronutrient(entry.quantity_consumed), 10000)),
        calories_consumed: Math.max(0, Math.min(validateCalories(entry.calories_consumed), 10000)),
        protein_g_consumed: Math.max(0, Math.min(validateMacronutrient(entry.protein_g_consumed), 1000)),
        carbs_g_consumed: Math.max(0, Math.min(validateMacronutrient(entry.carbs_g_consumed), 1000)),
        fat_g_consumed: Math.max(0, Math.min(validateMacronutrient(entry.fat_g_consumed), 1000)),
        health_score: entry.health_score ? Math.max(1, Math.min(entry.health_score, 10)) : undefined,
        notes: entry.notes ? sanitizeFoodName(entry.notes).substring(0, 500) : undefined,
        ingredients: entry.ingredients?.map(ingredient => ({
          name: sanitizeFoodName(ingredient.name).substring(0, 100),
          grams: Math.max(0, Math.min(validateMacronutrient(ingredient.grams), 1000)),
          calories: Math.max(0, Math.min(validateCalories(ingredient.calories), 1000)),
          protein: Math.max(0, Math.min(validateMacronutrient(ingredient.protein), 100)),
          carbs: Math.max(0, Math.min(validateMacronutrient(ingredient.carbs), 100)),
          fat: Math.max(0, Math.min(validateMacronutrient(ingredient.fat), 100))
        }))
      };

      const now = new Date();
      const newEntry = {
        ...sanitizedEntry,
        user_id: user.id,
        logged_at: now.toISOString(),
        log_date: now.toISOString().split('T')[0],
        ingredients: sanitizedEntry.ingredients ? sanitizedEntry.ingredients as any : null
      };

      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      // Update user streak
      await streak.updateStreak();

      const returnEntry: FoodLogEntry = {
        id: data.id,
        food_item_id: data.food_item_id || undefined,
        custom_food_name: data.custom_food_name || '',
        photo_url: data.photo_url || undefined,
        meal_type: data.meal_type,
        quantity_consumed: data.quantity_consumed,
        unit_consumed: data.unit_consumed || '',
        calories_consumed: data.calories_consumed,
        protein_g_consumed: data.protein_g_consumed,
        carbs_g_consumed: data.carbs_g_consumed,
        fat_g_consumed: data.fat_g_consumed,
        health_score: data.health_score || undefined,
        ingredients: data.ingredients as any,
        notes: data.notes || '',
        logged_at: data.logged_at,
        log_date: data.log_date
      };

      return returnEntry;
    } catch (error: any) {
      console.error('Error adding secure food entry:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo añadir la entrada de comida",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    secureAddEntry,
    loading
  };
};
