import { supabase } from '@/integrations/supabase/client';

/**
 * Simplified service to handle promo code pricing
 * Works with existing RevenueCat implementation
 */

interface PromoCodeInfo {
    hasPromoCode: boolean;
    discountValue: number; // 35.99 or 45.99
    code?: string;
}

/**
 * Get user's promo code information
 */
export const getUserPromoCodeInfo = async (userId: string): Promise<PromoCodeInfo> => {
    try {
        // Check if user has active promo code
        const { data: promoCode } = await supabase
            .from('user_promo_codes')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('applied_at', { ascending: false })
            .limit(1)
            .single();

        if (promoCode) {
            // User has promo code → $35.99
            return {
                hasPromoCode: true,
                discountValue: 35.99,
                code: promoCode.promo_code
            };
        } else {
            // No promo code → $45.99 (intro offer)
            return {
                hasPromoCode: false,
                discountValue: 45.99
            };
        }
    } catch (error) {
        console.error('Error getting promo code info:', error);
        // Default to intro offer
        return {
            hasPromoCode: false,
            discountValue: 45.99
        };
    }
};

/**
 * Get display price for yearly plan based on promo code
 */
export const getYearlyDisplayPrice = async (userId: string): Promise<string> => {
    const promoInfo = await getUserPromoCodeInfo(userId);
    return `$${promoInfo.discountValue.toFixed(2)}`;
};

/**
 * Check if user has applied a promo code
 */
export const hasAppliedPromoCode = async (userId: string): Promise<boolean> => {
    const promoInfo = await getUserPromoCodeInfo(userId);
    return promoInfo.hasPromoCode;
};
