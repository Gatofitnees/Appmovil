import { supabase } from '@/integrations/supabase/client';

/**
 * Clears all AI chat memory for the current authenticated user
 * This is called when the AI modal is closed to ensure a fresh chat on next open
 * Uses ai_workout_memory table with session_id field
 */
export const clearAIChatMemory = async (): Promise<void> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.warn('No authenticated user found, skipping chat memory cleanup');
            return;
        }

        // Delete all chat memory for this user using session_id
        // session_id is stored as user.id in string format
        const { error } = await supabase
            .from('ai_workout_memory')
            .delete()
            .eq('session_id', user.id);

        if (error) {
            console.error('Error clearing AI chat memory:', error);
            throw error;
        }

        console.log('✅ AI chat memory cleared successfully for session:', user.id);
    } catch (error) {
        console.error('Failed to clear AI chat memory:', error);
        // Don't throw - we don't want to block modal closing if cleanup fails
    }
};
