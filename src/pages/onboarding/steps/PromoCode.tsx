import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import Button from '@/components/Button';
import { OnboardingContext } from '../OnboardingFlow';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import OnboardingNavigation from '@/components/onboarding/OnboardingNavigation';
import { validatePromoCode } from '@/services/promoCodeService';
import { useAuth } from '@/contexts/AuthContext';

const PromoCode: React.FC = () => {
    const navigate = useNavigate();
    const context = useContext(OnboardingContext);
    const { user } = useAuth();
    const [promoCode, setPromoCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{
        isValid: boolean | null;
        message: string;
    }>({ isValid: null, message: '' });

    if (!context) {
        throw new Error('PromoCode must be used within OnboardingContext');
    }

    const { updateData } = context;

    const handleApplyCode = async () => {
        if (!promoCode.trim()) return;

        setIsValidating(true);
        setValidationResult({ isValid: null, message: '' });

        try {
            // For onboarding, we validate without user ID (will be applied later)
            // We'll use a temporary validation that just checks if code exists
            const result = await validatePromoCode(user?.id || 'temp', promoCode.trim());

            if (result.success) {
                setValidationResult({
                    isValid: true,
                    message: `¡Código válido! Descuento aplicado`
                });
                updateData({ promoCode: promoCode.trim().toUpperCase() });
            } else {
                setValidationResult({
                    isValid: false,
                    message: result.error || 'Código no válido'
                });
            }
        } catch (error) {
            setValidationResult({
                isValid: false,
                message: 'Error al validar el código'
            });
        } finally {
            setIsValidating(false);
        }
    };

    const handleContinue = () => {
        // Save promo code if entered and valid
        if (promoCode.trim() && validationResult.isValid) {
            updateData({ promoCode: promoCode.trim().toUpperCase() });
        }
        navigate('/onboarding/initial-recommendation');
    };

    return (
        <OnboardingLayout currentStep={16} totalSteps={21}>
            <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center space-y-8">
                {/* Icon */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
                    <Tag className="h-12 w-12 text-primary" />
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-foreground">
                        ¿Tienes un código promocional?
                    </h1>
                    <p className="text-base text-muted-foreground max-w-sm">
                        Ingresa tu código para obtener descuentos exclusivos en tu suscripción Premium
                    </p>
                </div>

                {/* Input with Apply Button */}
                <div className="w-full max-w-sm space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => {
                                    setPromoCode(e.target.value.toUpperCase());
                                    setValidationResult({ isValid: null, message: '' });
                                }}
                                placeholder="INGRESA TU CÓDIGO"
                                className="w-full px-4 py-3 pr-10 text-center text-sm font-bold tracking-wider bg-secondary/50 border-2 border-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase"
                                maxLength={20}
                            />
                            {/* Validation Icon */}
                            {validationResult.isValid !== null && !isValidating && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {validationResult.isValid ? (
                                        <Check className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <X className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                            )}
                            {isValidating && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleApplyCode}
                            disabled={!promoCode.trim() || isValidating}
                            className="px-6"
                        >
                            {isValidating ? 'Validando...' : 'Aplicar'}
                        </Button>
                    </div>

                    {/* Validation Message */}
                    {validationResult.message && (
                        <div
                            className={`text-sm text-center font-medium ${validationResult.isValid ? 'text-green-500' : 'text-red-500'
                                }`}
                        >
                            {validationResult.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Button */}
            <OnboardingNavigation
                onNext={handleContinue}
                nextLabel="Continuar"
            />
        </OnboardingLayout>
    );
};

export default PromoCode;

