import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPromoCodeInfo, getYearlyDisplayPrice, hasAppliedPromoCode } from '@/services/revenueCatPromoService';

/**
 * Hook to get promo code pricing information
 * Works with existing RevenueCat/PayPal implementation
 */
export const usePromoCodePricing = () => {
    const { user } = useAuth();
    const [hasPromoCode, setHasPromoCode] = useState(false);
    const [yearlyPrice, setYearlyPrice] = useState('$45.99');
    const [promoCode, setPromoCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPricing = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // Check if user has promo code
                const promoInfo = await getUserPromoCodeInfo(user.id);
                setHasPromoCode(promoInfo.hasPromoCode);
                setPromoCode(promoInfo.code || null);

                // Get display price
                const price = await getYearlyDisplayPrice(user.id);
                setYearlyPrice(price);
            } catch (error) {
                console.error('Error loading pricing:', error);
                // Default values
                setHasPromoCode(false);
                setYearlyPrice('$45.99');
                setPromoCode(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadPricing();
    }, [user]);

    // Reload pricing (call after applying promo code)
    const reloadPricing = async () => {
        if (!user) return;

        try {
            const promoInfo = await getUserPromoCodeInfo(user.id);
            setHasPromoCode(promoInfo.hasPromoCode);
            setPromoCode(promoInfo.code || null);

            const price = await getYearlyDisplayPrice(user.id);
            setYearlyPrice(price);
        } catch (error) {
            console.error('Error reloading pricing:', error);
        }
    };

    // Get the correct yearly product ID based on promo code status
    const getYearlyProductId = () => {
        return hasPromoCode ? 'yearly-promo-35' : 'yearly-intro-45';
    };

    return {
        hasPromoCode,
        promoCode,
        yearlyPrice,
        isLoading,
        reloadPricing,
        getYearlyProductId
    };
};
