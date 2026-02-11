import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validatePromoCode, applyPromoCodeToUser, PromoCodeValidation } from '@/services/promoCodeService';

export const usePromoCode = () => {
    const { user } = useAuth();
    const [promoCode, setPromoCode] = useState('');
    const [appliedCode, setAppliedCode] = useState<PromoCodeValidation | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const applyCode = useCallback(async (code: string) => {
        if (!user) {
            setError('Debes iniciar sesión para aplicar un código');
            return false;
        }

        if (!code.trim()) {
            setError('Ingresa un código promocional');
            return false;
        }

        setIsValidating(true);
        setError(null);

        try {
            // First validate
            const validationResult = await validatePromoCode(user.id, code);

            if (!validationResult.success) {
                setError(validationResult.error || 'Código no válido');
                return false;
            }

            // Then apply
            const applyResult = await applyPromoCodeToUser(user.id, code);

            if (applyResult.success) {
                setAppliedCode(applyResult);
                setPromoCode(code);
                return true;
            } else {
                setError(applyResult.error || 'Error al aplicar el código');
                return false;
            }
        } catch (err) {
            setError('Error al validar el código');
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [user]);

    const clearCode = useCallback(() => {
        setPromoCode('');
        setAppliedCode(null);
        setError(null);
    }, []);

    const getDiscountedPrice = useCallback((originalPrice: number): number => {
        if (!appliedCode || !appliedCode.success) {
            return originalPrice;
        }

        // Return the discount value directly (35.99)
        return appliedCode.discount_value || originalPrice;
    }, [appliedCode]);

    return {
        promoCode,
        setPromoCode,
        appliedCode,
        isValidating,
        error,
        applyCode,
        clearCode,
        getDiscountedPrice,
        hasAppliedCode: !!appliedCode?.success
    };
};
