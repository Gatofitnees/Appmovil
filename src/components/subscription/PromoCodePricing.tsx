import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getYearlyDisplayPrice, hasAppliedPromoCode } from '@/services/revenueCatPromoService';
import { Check } from 'lucide-react';

interface PromoCodePricingProps {
    onPriceLoad?: (price: string) => void;
}

export const PromoCodePricing: React.FC<PromoCodePricingProps> = ({ onPriceLoad }) => {
    const { user } = useAuth();
    const [hasPromo, setHasPromo] = useState(false);
    const [price, setPrice] = useState('$45.99');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPricing = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const hasCode = await hasAppliedPromoCode(user.id);
                const displayPrice = await getYearlyDisplayPrice(user.id);

                setHasPromo(hasCode);
                setPrice(displayPrice);

                if (onPriceLoad) {
                    onPriceLoad(displayPrice);
                }
            } catch (error) {
                console.error('Error loading pricing:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPricing();
    }, [user, onPriceLoad]);

    if (isLoading) {
        return null;
    }

    return (
        <>
            {hasPromo && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">
                        Código aplicado: Precio especial de {price}
                    </span>
                </div>
            )}

            <div className="text-center mb-2">
                <div className="text-sm text-gray-400 line-through">$59.99</div>
                <div className="text-3xl font-bold text-white">{price}</div>
                <div className="text-sm text-gray-400">primer año</div>
            </div>

            <div className="text-xs text-gray-500 text-center mt-2">
                Luego $59.99/año
            </div>
        </>
    );
};
