import { supabase } from '@/integrations/supabase/client';

export interface PromoCodeValidation {
    success: boolean;
    error?: string;
    code?: string;
    discount_value?: number;
}

/**
 * Validates a promo code for a user
 * @param userId - The user's ID
 * @param code - The promo code to validate
 * @returns Validation result with discount information
 */
export const validatePromoCode = async (
    userId: string,
    code: string
): Promise<PromoCodeValidation> => {
    try {
        const { data, error } = await supabase.rpc('validate_promo_code', {
            p_user_id: userId,
            p_code: code.toUpperCase().trim()
        });

        if (error) {
            console.error('Error validating promo code:', error);
            return {
                success: false,
                error: 'Error al validar el código'
            };
        }

        return data as PromoCodeValidation;
    } catch (error) {
        console.error('Error in validatePromoCode:', error);
        return {
            success: false,
            error: 'Error al procesar el código'
        };
    }
};

/**
 * Applies a promo code to a user
 * @param userId - The user's ID
 * @param code - The promo code to apply
 * @returns Application result
 */
export const applyPromoCodeToUser = async (
    userId: string,
    code: string
): Promise<PromoCodeValidation> => {
    try {
        const { data, error } = await supabase.rpc('apply_promo_code_to_user', {
            p_user_id: userId,
            p_code: code.toUpperCase().trim()
        });

        if (error) {
            console.error('Error applying promo code:', error);
            return {
                success: false,
                error: 'Error al aplicar el código'
            };
        }

        return data as PromoCodeValidation;
    } catch (error) {
        console.error('Error in applyPromoCodeToUser:', error);
        return {
            success: false,
            error: 'Error al procesar el código'
        };
    }
};

/**
 * Gets the user's active promo code if any
 * @param userId - The user's ID
 * @returns The active promo code information or null
 */
export const getUserActivePromoCode = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('user_promo_codes')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('applied_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error getting active promo code:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getUserActivePromoCode:', error);
        return null;
    }
};
