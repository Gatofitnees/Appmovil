
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { FoodLogEntry } from '@/types/foodLog';
import { validateAndSanitizeEntry, convertDbEntryToFoodLogEntry } from '@/utils/foodLogValidation';
import { createSecureErrorMessage, logSecurityEvent } from '@/utils/errorHandling';
import { useLocalTimezone } from './useLocalTimezone';
import { useStreaks } from './useStreaks';

// Función para extraer el path de la imagen desde la URL
const extractImagePathFromUrl = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'food-images');
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch (error) {
    console.error('Error extracting image path from URL:', error);
    return null;
  }
};

// Función para borrar imagen del storage
const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  try {
    const imagePath = extractImagePathFromUrl(imageUrl);
    if (!imagePath) {
      console.warn('Could not extract image path from URL:', imageUrl);
      return;
    }

    console.log('Deleting image from storage:', imagePath);
    const { error } = await supabase.storage
      .from('food-images')
      .remove([imagePath]);

    if (error) {
      console.error('Error deleting image from storage:', error);
    } else {
      console.log('Image deleted successfully from storage');
    }
  } catch (error) {
    console.error('Error in deleteImageFromStorage:', error);
  }
};

export const useFoodLogOperations = () => {
  const { getCurrentLocalDate, createLocalTimestamp } = useLocalTimezone();
  const streak = useStreaks();

  const addEntry = async (entry: Omit<FoodLogEntry, 'id' | 'logged_at' | 'log_date'>, targetDate?: string): Promise<FoodLogEntry | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logSecurityEvent('unauthorized_food_entry', 'User not authenticated');
        throw new Error('Usuario no autenticado');
      }

      const sanitizedEntry = validateAndSanitizeEntry(entry);



      const loggedAt = new Date().toISOString();
      const logDate = targetDate || getCurrentLocalDate();
      const newEntry = {
        ...sanitizedEntry,
        user_id: user.id,
        logged_at: loggedAt,
        log_date: logDate,
        ingredients: sanitizedEntry.ingredients ? sanitizedEntry.ingredients as Json : null
      };

      console.log('Inserting validated food entry with local date:', newEntry.log_date);

      const { data, error } = await supabase
        .from('daily_food_log_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      await streak.updateStreak();

      return convertDbEntryToFoodLogEntry(data);
    } catch (err) {
      logSecurityEvent('food_entry_error', 'Failed to add food entry');
      throw err;
    }
  };

  const updateEntry = async (id: number, updates: Partial<FoodLogEntry>): Promise<boolean> => {
    try {
      const sanitizedUpdates: any = {};

      if (updates.custom_food_name !== undefined) {
        sanitizedUpdates.custom_food_name = updates.custom_food_name;
      }
      if (updates.calories_consumed !== undefined) {
        sanitizedUpdates.calories_consumed = updates.calories_consumed;
      }
      if (updates.protein_g_consumed !== undefined) {
        sanitizedUpdates.protein_g_consumed = updates.protein_g_consumed;
      }
      if (updates.carbs_g_consumed !== undefined) {
        sanitizedUpdates.carbs_g_consumed = updates.carbs_g_consumed;
      }
      if (updates.fat_g_consumed !== undefined) {
        sanitizedUpdates.fat_g_consumed = updates.fat_g_consumed;
      }
      if (updates.ingredients !== undefined) {
        sanitizedUpdates.ingredients = updates.ingredients as Json;
      }

      const { error } = await supabase
        .from('daily_food_log_entries')
        .update(sanitizedUpdates)
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (err) {
      logSecurityEvent('food_update_error', 'Failed to update food entry');
      throw err;
    }
  };

  const deleteEntry = async (id: number): Promise<boolean> => {
    try {
      // Primero obtener la entrada para conseguir la URL de la imagen
      const { data: entryData, error: fetchError } = await supabase
        .from('daily_food_log_entries')
        .select('photo_url')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching entry for deletion:', fetchError);
        throw fetchError;
      }

      // Borrar la entrada de la base de datos
      const { error: deleteError } = await supabase
        .from('daily_food_log_entries')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Si la entrada tenía una imagen, borrarla del storage
      if (entryData?.photo_url) {
        console.log('Entry has photo, deleting from storage...');
        await deleteImageFromStorage(entryData.photo_url);
      }

      console.log('Food entry and associated image deleted successfully');
      return true;
    } catch (err) {
      logSecurityEvent('food_delete_error', 'Failed to delete food entry');
      throw err;
    }
  };

  return {
    addEntry,
    updateEntry,
    deleteEntry
  };
};
