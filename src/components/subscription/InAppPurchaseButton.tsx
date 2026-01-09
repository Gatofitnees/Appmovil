import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Crown } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useInAppPurchase } from '@/hooks/subscription/useInAppPurchase';

interface InAppPurchaseButtonProps {
  planType: 'monthly' | 'yearly';
  planName?: string;
  onSuccess?: () => void;
  disabled?: boolean;
  className?: string;
}

export const InAppPurchaseButton: React.FC<InAppPurchaseButtonProps> = ({
  planType,
  planName = planType === 'yearly' ? 'Suscripción Anual Premium' : 'Suscripción Mensual Premium',
  onSuccess,
  disabled = false,
  className = '',
}) => {
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  const { purchaseProduct, isLoading } = useInAppPurchase();

  useEffect(() => {
    // Solo mostrar este botón en plataformas nativas
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'ios' || platform === 'android';
    setIsNativePlatform(isNative);
  }, []);

  // Escuchar evento global de éxito para llamar onSuccess
  // El diálogo de éxito lo maneja PurchaseSuccessGlobal en App.tsx
  useEffect(() => {
    const handlePurchaseSuccess = () => {
      // Dar tiempo para que el usuario vea el diálogo antes de navegar
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    };

    window.addEventListener('iap:purchase-success', handlePurchaseSuccess);
    return () => {
      window.removeEventListener('iap:purchase-success', handlePurchaseSuccess);
    };
  }, [onSuccess]);

  if (!isNativePlatform) {
    return null; // No renderizar en web
  }

  const handlePurchase = async () => {
    // Mantener IDs de Apple intactos y usar IDs de Android cuando corresponda
    const platform = Capacitor.getPlatform();
    const productId = (() => {
      if (platform === 'android') {
        // Nuevo esquema: una suscripción con múltiples planes básicos
        // Formato: subscription_id:base_plan_id
        return planType === 'yearly' ? 'gatofit_premium:yearly' : 'gatofit_premium:monthly';
      }
      // iOS: conservar IDs existentes que ya funcionan
      return planType === 'yearly' ? 'SUSCRIPCION_ANUAL' : 'SUSCRIPCION_MENSUAL';
    })();

    // El resultado y diálogo de éxito se manejan via evento global
    // PurchaseSuccessGlobal en App.tsx escucha 'iap:purchase-success'
    await purchaseProduct(productId);
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={disabled || isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Procesando...
        </>
      ) : (
        <>
          <Crown className="w-4 h-4 mr-2" />
          Suscribirse
        </>
      )}
    </Button>
  );
};
