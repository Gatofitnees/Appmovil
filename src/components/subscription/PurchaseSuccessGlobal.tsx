import React, { useEffect, useState, useCallback } from 'react';
import { PurchaseSuccessDialog } from './PurchaseSuccessDialog';

interface SuccessDetail {
  planType: 'monthly' | 'yearly';
  planName: string;
  mode?: 'purchase' | 'restore';
}

export const PurchaseSuccessGlobal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [planName, setPlanName] = useState<string>('Suscripción Mensual Premium');
  const [mode, setMode] = useState<'purchase' | 'restore'>('purchase');

  const onClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const show = (detail: SuccessDetail) => {
      setPlanType(detail.planType);
      setPlanName(detail.planName);
      setMode(detail.mode ?? 'purchase');
      setIsOpen(true);
    };

    const onPurchase = (e: Event) => show((e as CustomEvent<SuccessDetail>).detail);
    const onRestore = (e: Event) => show((e as CustomEvent<SuccessDetail>).detail);

    window.addEventListener('iap:purchase-success', onPurchase as EventListener);
    window.addEventListener('iap:subscription-restored', onRestore as EventListener);
    return () => {
      window.removeEventListener('iap:purchase-success', onPurchase as EventListener);
      window.removeEventListener('iap:subscription-restored', onRestore as EventListener);
    };
  }, []);

  return (
    <PurchaseSuccessDialog
      isOpen={isOpen}
      onClose={onClose}
      planType={planType}
      planName={planName}
      mode={mode}
    />
  );
};
