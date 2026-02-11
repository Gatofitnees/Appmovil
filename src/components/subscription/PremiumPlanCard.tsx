
import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, CheckCircle, CreditCard, Ban } from 'lucide-react';
import Button from '@/components/Button';
import { SubscriptionPlan } from '@/hooks/subscription/types';
import { PayPalCheckoutModal } from './PayPalCheckoutModal';
import { InAppPurchaseButton } from './InAppPurchaseButton';
import { Capacitor } from '@capacitor/core';

interface PremiumPlanCardProps {
  plan: SubscriptionPlan;
  isRecommended?: boolean;
  onSelect: (planType: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
  discountText?: string;
  isCurrentPlan?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  onPayPalSuccess?: () => void;
}

export const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({
  plan,
  isRecommended = false,
  onSelect,
  isLoading = false,
  discountText,
  isCurrentPlan = false,
  isDisabled = false,
  disabledReason,
  onPayPalSuccess
}) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  const monthlyEquivalent = plan.plan_type === 'yearly' ? (plan.price_usd / 12).toFixed(2) : null;

  // Detectar si es plataforma nativa
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'ios' || platform === 'android';
    setIsNativePlatform(isNative);
  }, []);

  const handleOpenCheckout = () => {
    if (!isLoading) {
      setShowCheckoutModal(true);
    }
  };

  const handleCheckoutSuccess = () => {
    setShowCheckoutModal(false);
    if (onPayPalSuccess) {
      onPayPalSuccess();
    }
  };

  const getButtonContent = () => {
    if (isCurrentPlan) {
      return (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Plan Activo
        </div>
      );
    }

    if (isDisabled) {
      return (
        <div className="flex items-center justify-center gap-2">
          <Ban className="h-4 w-4" />
          No disponible
        </div>
      );
    }

    if (isLoading) {
      return 'Procesando...';
    }

    return (
      <div className="flex items-center justify-center gap-2">
        <CreditCard className="h-5 w-5" />
        Cambiar a este plan
      </div>
    );
  };

  const getButtonStyles = () => {
    if (isCurrentPlan) {
      return 'bg-green-500/20 text-green-400 cursor-not-allowed hover:bg-green-500/20';
    }

    if (isDisabled) {
      return 'bg-gray-500/20 text-gray-400 cursor-not-allowed hover:bg-gray-500/20';
    }

    if (isRecommended) {
      return 'bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-glow';
    }

    return 'bg-secondary hover:bg-secondary/80';
  };

  return (
    <div className={`relative neu-card ${isRecommended ? 'pt-12 pb-6 px-6 ring-2 ring-primary/50 shadow-glow' : 'p-6'} ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}>
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-primary to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            ¡Oferta Especial: Ahorra 61%!
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <div className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Activo
          </div>
        </div>
      )}

      {/* Discount Text */}
      {discountText && !isRecommended && !isCurrentPlan && (
        <div className="absolute -top-2 right-4">
          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {discountText}
          </span>
        </div>
      )}

      <div className="text-center space-y-4">
        {/* Plan Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h3 className="text-xl font-bold">{plan.name}</h3>
          </div>

          {/* Price Display */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-primary">${plan.price_usd}</span>
              <span className="text-muted-foreground">
                /{plan.plan_type === 'yearly' ? 'año' : 'mes'}
              </span>
            </div>
            {monthlyEquivalent && (
              <p className="text-green-500 font-medium text-sm">
                Equivale a ${monthlyEquivalent}/mes
              </p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium">Rutinas ilimitadas</p>
              <p className="text-xs text-muted-foreground">Sin restricciones de creación</p>
            </div>
            <Check className="h-4 w-4 text-green-500 ml-auto" />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium">Análisis nutricional IA</p>
              <p className="text-xs text-muted-foreground">Escaneos ilimitados semanales</p>
            </div>
            <Check className="h-4 w-4 text-green-500 ml-auto" />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <Star className="h-4 w-4 text-white fill-current" />
            </div>
            <div className="text-left">
              <p className="font-medium">Chat IA ilimitado</p>
              <p className="text-xs text-muted-foreground">Asesoría personalizada 24/7</p>
            </div>
            <Check className="h-4 w-4 text-green-500 ml-auto" />
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          {isNativePlatform && !isCurrentPlan && !isDisabled ? (
            // Usar compra in-app para plataformas nativas
            <InAppPurchaseButton
              planType={plan.plan_type as 'monthly' | 'yearly'}
              planName={plan.name}
              onSuccess={handleCheckoutSuccess}
              disabled={isLoading}
              className="w-full py-3 text-base font-semibold"
            />
          ) : (
            // Usar PayPal para web
            <Button
              onClick={!isCurrentPlan && !isDisabled ? handleOpenCheckout : undefined}
              disabled={isCurrentPlan || isDisabled || isLoading}
              className={`w-full py-3 text-base font-semibold ${getButtonStyles()}`}
              size="lg"
            >
              {getButtonContent()}
            </Button>
          )}
          {isDisabled && disabledReason && (
            <p className="text-xs text-muted-foreground text-center">{disabledReason}</p>
          )}
        </div>

        {!isNativePlatform && (
          <PayPalCheckoutModal
            isOpen={showCheckoutModal}
            onClose={() => setShowCheckoutModal(false)}
            planType={plan.plan_type as 'monthly' | 'yearly'}
            planName={plan.name}
            originalPrice={plan.price_usd}
            onSuccess={handleCheckoutSuccess}
          />
        )}
      </div>
    </div>
  );
};
