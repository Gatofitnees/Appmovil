import React, { createContext, useContext, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPlan, UserSubscription } from '@/hooks/subscription/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface SubscriptionData {
    subscription: UserSubscription | null;
    isPremium: boolean;
    isAsesorado: boolean;
}

interface SubscriptionContextType {
    subscription: UserSubscription | null;
    plans: SubscriptionPlan[];
    isLoading: boolean;
    isPremium: boolean;
    isAsesorado: boolean;
    isError: boolean;
    checkPremiumStatus: () => Promise<boolean>;
    checkUserPremiumStatus: (userId: string) => Promise<boolean>;
    upgradeSubscription: (planType: 'monthly' | 'yearly' | 'asesorados', transactionId?: string) => Promise<boolean>;
    cancelSubscription: () => Promise<boolean>;
    refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // 1. Query for Subscription Plans
    const { data: plans = [] } = useQuery({
        queryKey: ['subscription_plans'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .in('plan_type', ['monthly', 'yearly'])
                .order('price_usd');

            if (error) throw error;

            return (data || [])
                .filter(plan => plan.plan_type !== 'free')
                .map(plan => ({
                    ...plan,
                    plan_type: plan.plan_type as 'monthly' | 'yearly',
                    features: typeof plan.features === 'string'
                        ? JSON.parse(plan.features)
                        : plan.features as { routines_limit: number; nutrition_photos_weekly: number; ai_chat_messages_weekly: number; }
                })) as SubscriptionPlan[];
        },
        staleTime: 24 * 60 * 60 * 1000 // Cache plans for 24 hours
    });

    // 2. Query for User Subscription Data
    const { data: subData, isLoading, isError, refetch } = useQuery<SubscriptionData>({
        queryKey: ['user_subscription', user?.id],
        queryFn: async () => {
            if (!user) {
                return { subscription: null, isPremium: false, isAsesorado: false };
            }

            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error fetching subscription:', error);
                throw error;
            }

            let subscription = data ? (data as UserSubscription) : null;
            let isActiveAsesorado = false;

            if (data) {
                const planType = data.plan_type as string;
                isActiveAsesorado = planType === 'asesorados' && data.status === 'active';
            }

            // Always check coach assignment if we don't have active asesorado from plan
            if (!isActiveAsesorado) {
                const { data: coachAssignment, error: coachError } = await supabase
                    .from('coach_user_assignments')
                    .select('coach_id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (coachError) {
                    console.error("Error fetching coach assignment", coachError);
                }

                if (coachAssignment) {
                    isActiveAsesorado = true;
                }
            }

            let isPremium = false;

            if (data) {
                const planType = data.plan_type as string;
                const expiresAt = data.expires_at ? new Date(data.expires_at) : null;
                const isExpired = expiresAt && expiresAt < new Date();

                const isValidStatus = data.status === 'active' || data.status === 'trialing';
                const hasValidPlan = planType === 'monthly' || planType === 'yearly' || isActiveAsesorado;

                isPremium = hasValidPlan && isValidStatus && !isExpired;
            }

            return {
                subscription,
                isPremium,
                isAsesorado: isActiveAsesorado
            };
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000 // Cache subscription validity for 5 minutes
    });

    const subscription = subData?.subscription || null;
    const isPremium = subData?.isPremium || false;
    const isAsesorado = subData?.isAsesorado || false;

    useEffect(() => {
        if (user) {
            // Listen for IAP events to refresh data immediately
            const handlePurchaseUpdate = () => {
                console.log('🔄 SubscriptionContext: Refreshing data due to purchase/restore');
                queryClient.invalidateQueries({ queryKey: ['user_subscription', user.id] });
            };

            window.addEventListener('iap:purchase-success', handlePurchaseUpdate);
            window.addEventListener('iap:subscription-restored', handlePurchaseUpdate);

            return () => {
                window.removeEventListener('iap:purchase-success', handlePurchaseUpdate);
                window.removeEventListener('iap:subscription-restored', handlePurchaseUpdate);
            };
        }
    }, [user, queryClient]);

    const checkPremiumStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data, error } = await supabase.rpc('is_user_premium', {
                user_id: user.id
            });

            if (error) throw error;
            return data as boolean;
        } catch (error) {
            console.error('Error checking premium status:', error);
            return false;
        }
    };

    const checkUserPremiumStatus = async (userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('status, plan_type')
                .eq('user_id', userId)
                .single();

            if (error) return false;

            return data?.status === 'active' &&
                (data?.plan_type === 'monthly' || data?.plan_type === 'yearly' || (data?.plan_type as any) === 'asesorados');
        } catch (error) {
            console.error('Error checking user premium status:', error);
            return false;
        }
    };

    const upgradeSubscription = async (planType: 'monthly' | 'yearly' | 'asesorados', transactionId?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const plan = plans.find(p => p.plan_type === planType);
            if (!plan && planType !== 'asesorados') throw new Error('Plan no encontrado');

            const expiresAt = new Date();
            // Fallback to 30 days if plan isn't mapped
            expiresAt.setDate(expiresAt.getDate() + (plan ? plan.duration_days : 30));

            const { data: existingSubscription } = await supabase
                .from('user_subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingSubscription) {
                const { error } = await supabase
                    .from('user_subscriptions')
                    .update({
                        plan_type: planType as any,
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
                        plan_type: planType as any,
                        status: 'active',
                        expires_at: expiresAt.toISOString(),
                        store_transaction_id: transactionId,
                        auto_renewal: true
                    });

                if (error) throw error;
            }

            await queryClient.invalidateQueries({ queryKey: ['user_subscription', user.id] });
            return true;
        } catch (error) {
            console.error('Error upgrading subscription:', error);
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

            await queryClient.invalidateQueries({ queryKey: ['user_subscription', user.id] });

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

    return (
        <SubscriptionContext.Provider value={{
            subscription,
            plans,
            isLoading,
            isPremium,
            isAsesorado,
            isError,
            checkPremiumStatus,
            checkUserPremiumStatus,
            upgradeSubscription,
            cancelSubscription,
            refetch: async () => {
                await refetch();
            }
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscriptionContext = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
    }
    return context;
};
