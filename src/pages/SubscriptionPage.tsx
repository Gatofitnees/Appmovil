
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Sparkles, Loader2, AlertCircle, XCircle, Info, Check } from 'lucide-react';
import Button from '@/components/Button';
import { useSubscription } from '@/hooks/subscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { UsageLimitsBanner } from '@/components/premium/UsageLimitsBanner';
import { PremiumPlanCard } from '@/components/subscription/PremiumPlanCard';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { PlanChangeConfirmDialog } from '@/components/subscription/PlanChangeConfirmDialog';
import { CancelConfirmDialog } from '@/components/subscription/CancelConfirmDialog';
import { PromoCodeInput } from '@/components/subscription/PromoCodeInput';
import { PromoCodePricing } from '@/components/subscription/PromoCodePricing';
import { usePromoCodePricing } from '@/hooks/useRevenueCatSubscription';

import { PaymentFailureAlert } from '@/components/subscription/PaymentFailureAlert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    subscription,
    plans,
    isPremium,
    upgradeSubscription,
    cancelSubscription
  } = useSubscription();
  const { usage } = useUsageLimits();

  // Promo code pricing
  const {
    hasPromoCode,
    yearlyPrice,
    isLoading: isPricingLoading,
    reloadPricing
  } = usePromoCodePricing();

  const [isLoading, setIsLoading] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [paymentFailure, setPaymentFailure] = useState<any>(null);

  const monthlyPlan = plans.find(p => p.plan_type === 'monthly');
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');

  // Fetch payment failure info if subscription status is payment_failed
  useEffect(() => {
    const fetchPaymentFailure = async () => {
      if (subscription?.status === 'payment_failed') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('subscription_payment_failures')
          .select('*')
          .eq('user_id', user.id)
          .is('resolved_at', null)
          .order('failed_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setPaymentFailure(data);
        }
      } else {
        setPaymentFailure(null);
      }
    };

    fetchPaymentFailure();
  }, [subscription?.status]);

  // Detectar retorno de PayPal y verificar pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const subscriptionId = urlParams.get('subscription_id') || urlParams.get('ba_token');

    if (success === 'true' && subscriptionId && !isLoading) {
      handlePayPalReturn(subscriptionId);
    }
  }, []);

  const handlePayPalReturn = async (subscriptionId: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Recuperar código de descuento del localStorage si existe
      const discountCode = localStorage.getItem('pending_discount_code');

      const { data, error } = await supabase.functions.invoke('verify-paypal-payment', {
        body: {
          subscriptionId,
          userId: user.id,
          discountCode: discountCode || undefined
        }
      });

      // Limpiar localStorage
      localStorage.removeItem('pending_discount_code');
      localStorage.removeItem('pending_subscription_id');

      if (error) throw error;

      if (data?.success) {
        const bonusMessage = data.subscription?.bonusMonthsApplied
          ? ` ¡Incluye ${data.subscription.bonusMonthsApplied} meses gratis!`
          : '';

        toast({
          title: "¡Pago confirmado!",
          description: `Tu suscripción premium ha sido activada exitosamente.${bonusMessage}`,
        });

        // Limpiar URL y recargar datos
        window.history.replaceState({}, '', '/subscription');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error(data?.error || 'Error al verificar pago');
      }
    } catch (error) {
      console.error('Error verifying PayPal payment:', error);
      toast({
        title: "Error",
        description: "No pudimos confirmar tu pago. Contacta soporte si el problema persiste.",
        variant: "destructive"
      });

      // Limpiar URL incluso si hay error
      window.history.replaceState({}, '', '/subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelection = async (planType: 'monthly' | 'yearly') => {
    // Si ya tiene este plan activo, no hacer nada
    if (subscription?.plan_type === planType && subscription?.status === 'active') {
      toast({
        title: "Plan actual",
        description: "Ya tienes este plan activo. Selecciona el otro plan para cambiar.",
        variant: "default"
      });
      return;
    }

    // VALIDACIÓN CRÍTICA: Bloquear downgrade de Anual a Mensual
    if (subscription?.plan_type === 'yearly' && planType === 'monthly' && subscription?.status === 'active') {
      toast({
        title: "Cambio no disponible",
        description: "No puedes cambiar de plan Anual a Mensual hasta que expire tu suscripción actual. Tu plan Anual te ofrece más beneficios a mejor precio.",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    // If user already has a premium plan, handle accordingly
    if (isPremium && subscription?.status === 'active') {
      // Plan diferente - mostrar diálogo para cambio inmediato (solo upgrade)
      setSelectedPlan(planType);
      setShowPlanChangeDialog(true);
    } else {
      // Direct upgrade for free users
      await handleDirectUpgrade(planType);
    }
  };

  const handleDirectUpgrade = async (planType: 'monthly' | 'yearly') => {
    setIsLoading(true);
    try {
      const success = await upgradeSubscription(planType);
      if (success) {
        // Success message is already shown by the hook
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);
    try {
      const success = await upgradeSubscription(selectedPlan);
      if (success) {
        setShowPlanChangeDialog(false);
        setSelectedPlan(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);

    // SPECIAL CASE: Permanent cancellation during grace period
    if (subscription?.status === 'payment_failed') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        // 1. Cancel in PayPal if exists
        if (subscription?.paypal_subscription_id) {
          await supabase.functions.invoke('cancel-paypal-subscription', {
            body: {
              subscriptionId: subscription.paypal_subscription_id,
              reason: 'User cancelled during grace period'
            }
          });
        }

        // 2. Update DB to FREE
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            plan_type: 'free',
            status: 'active',
            auto_renewal: false,
            cancelled_at: new Date().toISOString(),
            paypal_subscription_id: null,
            expires_at: null,
            payment_failed_at: null,
            suspended_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // 3. Mark payment failure as resolved
        await supabase
          .from('subscription_payment_failures')
          .update({ resolved_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .is('resolved_at', null);

        toast({
          title: "Suscripción cancelada",
          description: "Has vuelto al plan gratuito. Puedes suscribirte nuevamente cuando desees.",
        });

        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('Error cancelling during grace period:', error);
        toast({
          title: "Error",
          description: "No pudimos cancelar. Intenta de nuevo.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
      setShowCancelDialog(false);
      return;
    }

    // NORMAL FLOW: Active subscription cancellation
    try {
      // Check if already cancelled
      if (subscription?.auto_renewal === false) {
        toast({
          title: "Suscripción ya cancelada",
          description: "Tu suscripción ya fue cancelada anteriormente",
          variant: "default"
        });
        setShowCancelDialog(false);
        setIsLoading(false);
        return;
      }

      // Try to cancel in PayPal if has subscription ID
      if (subscription?.paypal_subscription_id) {
        const { data, error } = await supabase.functions.invoke('cancel-paypal-subscription', {
          body: {
            subscriptionId: subscription.paypal_subscription_id,
            reason: 'User requested cancellation'
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw new Error('No se pudo comunicar con el servidor de pagos');
        }

        if (data?.success) {
          toast({
            title: "Suscripción cancelada",
            description: data.message || "Tu suscripción ha sido cancelada exitosamente",
          });

          // Reload to update subscription status
          window.location.reload();
        } else {
          throw new Error(data?.error || 'Error desconocido al cancelar');
        }
      } else {
        // Fallback: cancel only in local DB
        await cancelSubscription();
        window.location.reload();
      }

      setShowCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error al cancelar",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    try {
      if (!subscription?.paypal_subscription_id) {
        toast({
          title: "Error",
          description: "No se encontró información de la suscripción",
          variant: "destructive"
        });
        return;
      }

      // Validar si la suscripción ha expirado
      if (subscription?.expires_at && new Date(subscription.expires_at) < new Date()) {
        toast({
          title: "Suscripción expirada",
          description: "Tu suscripción ha expirado. Necesitas crear una nueva suscripción.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('activate-paypal-subscription', {
        body: {
          subscriptionId: subscription.paypal_subscription_id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('No se pudo comunicar con el servidor de pagos');
      }

      if (data?.success) {
        toast({
          title: "Suscripción reactivada",
          description: "Tu suscripción ha sido reactivada exitosamente",
        });

        window.location.reload();
      } else if (data?.error === 'expired') {
        toast({
          title: "Suscripción expirada",
          description: "Tu suscripción ha expirado. Necesitas crear una nueva suscripción.",
          variant: "destructive"
        });
      } else if (data?.error === 'cancelled') {
        toast({
          title: "Suscripción cancelada",
          description: "Esta suscripción fue cancelada permanentemente. Por favor, selecciona un nuevo plan abajo.",
          variant: "destructive"
        });
        // Scroll to plans section
        setTimeout(() => {
          const plansSection = document.querySelector('[data-plans-section]');
          if (plansSection) {
            plansSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      } else {
        throw new Error(data?.error || 'Error desconocido al reactivar');
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Error al reactivar",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/home")}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Suscripción
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Verificando pago de PayPal */}
        {isLoading && new URLSearchParams(window.location.search).get('success') === 'true' && (
          <div className="neu-card p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Verificando tu pago...</p>
          </div>
        )}

        {/* Payment Failure Alert - Prominent */}
        {subscription?.status === 'payment_failed' && paymentFailure && (
          <div className="space-y-3">
            <PaymentFailureAlert
              gracePeriodEndsAt={paymentFailure.grace_period_ends_at}
            />
            <div className="neu-card p-4 bg-blue-500/5 border border-blue-500/20">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Tip:</strong> Puedes reintentar verificar el pago arriba, o crear una nueva suscripción seleccionando un plan abajo
              </p>
            </div>
          </div>
        )}

        {/* Current Status */}
        <SubscriptionStatus subscription={subscription} isPremium={isPremium} />


        {/* Usage Stats for Free Users */}
        {!isPremium && usage && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Uso actual</h3>
            </div>
            <div className="space-y-3">
              <UsageLimitsBanner type="routines" />
              <UsageLimitsBanner type="nutrition" />
              <UsageLimitsBanner type="ai_chat" />
            </div>
          </div>
        )}

        {/* Premium Benefits Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold">
              {isPremium ? 'Planes Premium' : 'Beneficios Premium'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {isPremium ?
              'Cambia tu plan cuando quieras' :
              'Desbloquea todo el potencial de tu entrenamiento'
            }
          </p>
        </div>

        {/* Promo Code Input - Only for non-premium users */}
        {!isPremium && (
          <div className="space-y-4">
            <PromoCodeInput onCodeApplied={reloadPricing} />

            {/* Promo Code Pricing Display */}
            {hasPromoCode && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">
                  Código aplicado: Precio especial de {yearlyPrice}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Subscription Plans */}
        <div className="space-y-4" data-plans-section>
          {/* Yearly Plan - Recommended */}
          {yearlyPlan && (
            <PremiumPlanCard
              plan={yearlyPlan}
              isRecommended={!isPremium}
              onSelect={handlePlanSelection}
              isLoading={isLoading}
              isCurrentPlan={subscription?.plan_type === 'yearly' && subscription?.status === 'active'}
              onPayPalSuccess={() => {
                // Refetch subscription data after PayPal payment
                window.location.reload();
              }}
            />
          )}

          {/* Monthly Plan */}
          {monthlyPlan && (
            <PremiumPlanCard
              plan={monthlyPlan}
              onSelect={handlePlanSelection}
              isLoading={isLoading}
              discountText="Flexible"
              isCurrentPlan={subscription?.plan_type === 'monthly' && subscription?.status === 'active'}
              isDisabled={subscription?.plan_type === 'yearly' && subscription?.status === 'active'}
              disabledReason="No puedes cambiar de Anual a Mensual"
              onPayPalSuccess={() => {
                // Refetch subscription data after PayPal payment
                window.location.reload();
              }}
            />
          )}
        </div>

        {/* Subscription Already Cancelled - Not Expired Yet */}
        {isPremium &&
          subscription?.status === 'active' &&
          subscription?.auto_renewal === false &&
          subscription?.expires_at &&
          new Date(subscription.expires_at) > new Date() && (
            <div className="neu-card p-6 border border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base">Suscripción cancelada</h3>
                    <p className="text-sm text-muted-foreground">
                      Tu suscripción ya fue cancelada y no se renovará automáticamente.
                      Seguirás teniendo acceso premium hasta {new Date(subscription.expires_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ¿Cambiaste de opinión? Puedes reactivar tu suscripción ahora.
                    </p>
                  </div>
                  {subscription?.paypal_subscription_id && (
                    <Button
                      variant="primary"
                      onClick={handleReactivateSubscription}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Reactivando...
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Reactivar suscripción
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

        {/* Subscription Expired or Cancelled and Expired - Renew Section */}
        {((subscription?.status === 'expired') ||
          (subscription?.status === 'active' &&
            subscription?.auto_renewal === false &&
            subscription?.expires_at &&
            new Date(subscription.expires_at) <= new Date())) && (
            <div className="neu-card p-6 border border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base">Renovar suscripción</h3>
                    <p className="text-sm text-muted-foreground">
                      Tu suscripción ha expirado. Para volver a disfrutar de los beneficios premium, selecciona un nuevo plan arriba.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground space-y-2 pt-4">
          <div className="flex items-center justify-center gap-1">
            <Crown className="h-3 w-3 text-yellow-500" />
            <span>Los pagos se procesan de forma segura</span>
          </div>
          <p>Cancela en cualquier momento desde la configuración de tu cuenta.</p>
        </div>
      </div>

      {/* Plan Change Confirmation Dialog */}
      <PlanChangeConfirmDialog
        isOpen={showPlanChangeDialog}
        onClose={() => {
          setShowPlanChangeDialog(false);
          setSelectedPlan(null);
        }}
        onConfirm={handleConfirmPlanChange}
        currentPlan={subscription?.plan_type === 'monthly' ? monthlyPlan : yearlyPlan}
        newPlan={selectedPlan === 'monthly' ? monthlyPlan : yearlyPlan}
        expirationDate={subscription?.expires_at || null}
        isLoading={isLoading}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelSubscription}
        isLoading={isLoading}
        isPaymentFailed={subscription?.status === 'payment_failed'}
      />
    </div>
  );
};

export default SubscriptionPage;
