import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionCache } from './useSubscriptionCache';
import type { SubscriptionPlan, UserSubscription, CancelScheduledChangeResult } from './types';

export const useOptimizedSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isAsesorado, setIsAsesorado] = useState(false);
  const { toast } = useToast();
  const { checkUserPremiumStatus: checkCachedPremiumStatus } = useSubscriptionCache();

  const fetchSubscriptionData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Intentar obtener suscripción existente
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);

        // Si hay error, asegurar que el usuario tenga una suscripción
        const { error: ensureError } = await supabase.rpc('ensure_user_subscription', {
          p_user_id: user.id
        });

        if (ensureError) {
          console.error('Error ensuring subscription:', ensureError);
        } else {
          // Reintentar obtener la suscripción
          const { data: retryData } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (retryData) {
            setSubscription(retryData);
            setIsAsesorado(retryData.plan_type === 'asesorados' && retryData.status === 'active');
            setIsPremium((retryData.plan_type === 'monthly' || retryData.plan_type === 'yearly' || retryData.plan_type === 'asesorados') && retryData.status === 'active');
          }
        }
        return;
      }

      if (data) {
        setSubscription(data);
        setIsAsesorado(data.plan_type === 'asesorados' && data.status === 'active');
        setIsPremium((data.plan_type === 'monthly' || data.plan_type === 'yearly' || data.plan_type === 'asesorados') && data.status === 'active');
      } else {
        // No existe suscripción, crear una
        await supabase.rpc('ensure_user_subscription', {
          p_user_id: user.id
        });

        // Obtener la suscripción recién creada
        const { data: newData } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (newData) {
          setSubscription(newData);
          setIsAsesorado(false);
          setIsPremium(false); // Nueva suscripción siempre es free
        }
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .in('plan_type', ['monthly', 'yearly'])
        .order('price_usd');

      if (error) throw error;

      const transformedPlans: SubscriptionPlan[] = (data || [])
        .filter(plan => plan.plan_type !== 'free')
        .map(plan => ({
          ...plan,
          plan_type: plan.plan_type as 'monthly' | 'yearly',
          features: typeof plan.features === 'string'
            ? JSON.parse(plan.features)
            : plan.features as { routines_limit: number; nutrition_photos_weekly: number; ai_chat_messages_weekly: number; }
        }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
    fetchPlans();
  }, [fetchSubscriptionData, fetchPlans]);

  const checkPremiumStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const premium = await checkCachedPremiumStatus(user.id);
      setIsPremium(premium);
      return premium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }, [checkCachedPremiumStatus]);

  const scheduleOrUpgradeSubscription = async (planType: 'monthly' | 'yearly', transactionId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const plan = plans.find(p => p.plan_type === planType);
      if (!plan) throw new Error('Plan no encontrado');

      // Si no tiene plan o tiene plan free, upgrade directo
      if (!subscription || subscription.plan_type === 'free') {
        return await upgradeSubscription(planType, transactionId);
      }

      // VALIDACIÓN: Si ya tiene el mismo plan activo, rechazar
      if (subscription.plan_type === planType && subscription.status === 'active') {
        toast({
          title: "Plan actual",
          description: "Ya tienes este plan activo",
        });
        return false;
      }

      // VALIDACIÓN: Bloquear downgrade de yearly a monthly
      if (subscription.plan_type === 'yearly' && planType === 'monthly' && subscription.status === 'active') {
        toast({
          title: "Cambio no disponible",
          description: "No puedes cambiar de plan Anual a Mensual",
          variant: "destructive"
        });
        return false;
      }

      // Si tiene plan activo diferente, usar PayPal Revise API (solo upgrade: monthly -> yearly)
      if (subscription.status === 'active' && subscription.plan_type !== planType) {
        if (!subscription.paypal_subscription_id) {
          throw new Error('No se encontró ID de suscripción de PayPal');
        }

        const { data, error } = await supabase.functions.invoke(
          'revise-paypal-subscription',
          {
            body: {
              currentSubscriptionId: subscription.paypal_subscription_id,
              newPlanType: planType,
              userId: user.id,
              returnUrl: `${window.location.origin}/subscription?change_approved=true`,
              cancelUrl: `${window.location.origin}/subscription?change_cancelled=true`
            }
          }
        );

        if (error) throw error;

        if (!data?.approvalUrl) {
          throw new Error('No se recibió URL de aprobación de PayPal');
        }

        // Actualizar DB con cambio programado
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            next_plan_type: planType,
            next_plan_starts_at: subscription.expires_at,
            scheduled_change_created_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Redirigir a PayPal para aprobar
        window.location.href = data.approvalUrl;

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error scheduling/upgrading subscription:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar el cambio de plan",
        variant: "destructive"
      });
      return false;
    }
  };

  const upgradeSubscription = async (planType: 'monthly' | 'yearly', transactionId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const plan = plans.find(p => p.plan_type === planType);
      if (!plan) throw new Error('Plan no encontrado');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingSubscription) {
        const { error } = await supabase
          .from('user_subscriptions')
          .update({
            plan_type: planType,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            store_transaction_id: transactionId,
            auto_renewal: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            plan_type: planType,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            store_transaction_id: transactionId,
            auto_renewal: true
          });

        if (error) throw error;
      }

      await fetchSubscriptionData();
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
    }
  };

  const cancelScheduledPlanChange = async (): Promise<CancelScheduledChangeResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Simply clear scheduled change in DB
      // No need to cancel in PayPal - the original subscription continues
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          next_plan_type: null,
          next_plan_starts_at: null,
          scheduled_change_created_at: null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSubscriptionData();

      toast({
        title: "Cambio cancelado",
        description: "Continuarás con tu plan actual sin cambios",
      });

      return { success: true };
    } catch (error) {
      console.error('Error canceling scheduled plan change:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar el cambio programado",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  const suspendSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      if (!subscription?.paypal_subscription_id) {
        throw new Error('No se encontró ID de suscripción de PayPal');
      }

      const { error } = await supabase.functions.invoke('suspend-paypal-subscription', {
        body: {
          subscriptionId: subscription.paypal_subscription_id,
          reason: 'User requested temporary suspension',
        },
      });

      if (error) throw error;

      await fetchSubscriptionData();

      toast({
        title: "Suscripción pausada",
        description: "Tu suscripción se ha pausado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error suspending subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo pausar la suscripción",
        variant: "destructive"
      });
      return false;
    }
  };

  const reactivateSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      if (!subscription?.paypal_subscription_id) {
        throw new Error('No se encontró ID de suscripción de PayPal');
      }

      const { error } = await supabase.functions.invoke('activate-paypal-subscription', {
        body: {
          subscriptionId: subscription.paypal_subscription_id,
          reason: 'User requested reactivation',
        },
      });

      if (error) throw error;

      await fetchSubscriptionData();

      toast({
        title: "Suscripción reactivada",
        description: "Tu suscripción se ha reactivado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo reactivar la suscripción",
        variant: "destructive"
      });
      return false;
    }
  };

  const cancelSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renewal: false
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSubscriptionData();

      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción se ha cancelado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción",
        variant: "destructive"
      });
      return false;
    }
  };

  const hasScheduledChange = subscription?.next_plan_type && subscription?.next_plan_starts_at;

  return {
    subscription,
    plans,
    isLoading,
    isPremium,
    isAsesorado,
    hasScheduledChange,
    checkPremiumStatus,
    checkUserPremiumStatus: checkCachedPremiumStatus,
    upgradeSubscription: scheduleOrUpgradeSubscription,
    suspendSubscription,
    reactivateSubscription,
    cancelSubscription,
    cancelScheduledPlanChange,
    refetch: fetchSubscriptionData
  };
};
