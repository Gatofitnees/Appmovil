import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPlan, UserSubscription } from '@/hooks/subscription/types';

interface SubscriptionContextType {
    subscription: UserSubscription | null;
    plans: SubscriptionPlan[];
    isLoading: boolean;
    isPremium: boolean;
    isAsesorado: boolean;
    checkPremiumStatus: () => Promise<boolean>;
    checkUserPremiumStatus: (userId: string) => Promise<boolean>;
    upgradeSubscription: (planType: 'monthly' | 'yearly' | 'asesorados', transactionId?: string) => Promise<boolean>;
    cancelSubscription: () => Promise<boolean>;
    refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [isAsesorado, setIsAsesorado] = useState(false);
    const { toast } = useToast();

    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            fetchSubscriptionData();
        } else {
            setSubscription(null);
            setIsPremium(false);
            setIsAsesorado(false);
            setIsLoading(false);
        }
        fetchPlans();
    }, [user]);

    const fetchSubscriptionData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('user_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error('Error fetching subscription:', error);
                setIsLoading(false);
                return;
            }

            if (data) {
                setSubscription(data as UserSubscription);
                const planType = data.plan_type as string;
                let isActiveAsesorado = planType === 'asesorados' && data.status === 'active';

                // If not already detected via plan, check coach assignment
                if (!isActiveAsesorado) {
                    const { data: coachAssignment } = await supabase
                        .from('coach_user_assignments')
                        .select('coach_id')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (coachAssignment) {
                        isActiveAsesorado = true;
                    }
                }

                setIsAsesorado(isActiveAsesorado);
                setIsPremium((planType === 'monthly' || planType === 'yearly' || isActiveAsesorado) && data.status === 'active');
            } else {
                // If no subscription record, still check coach assignment
                const { data: coachAssignment } = await supabase
                    .from('coach_user_assignments')
                    .select('coach_id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                setSubscription(null);
                setIsAsesorado(!!coachAssignment);
                setIsPremium(false);
            }
        } catch (error) {
            console.error('Error in fetchSubscriptionData:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async () => {
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
    };

    const checkPremiumStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            const { data, error } = await supabase.rpc('is_user_premium', {
                user_id: user.id
            });

            if (error) throw error;

            const premium = data as boolean;
            // We don't update local state here to avoid race conditions with the main fetch
            // But we could trigger a refetch if needed
            return premium;
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

            await fetchSubscriptionData();
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

    return (
        <SubscriptionContext.Provider value={{
            subscription,
            plans,
            isLoading,
            isPremium,
            isAsesorado,
            checkPremiumStatus,
            checkUserPremiumStatus,
            upgradeSubscription,
            cancelSubscription,
            refetch: fetchSubscriptionData
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
