import { SubscriptionPlan, UserSubscription } from '@/hooks/subscription/types';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';

// Re-export types for backward compatibility
export type { SubscriptionPlan, UserSubscription };

export const useSubscription = () => {
  return useSubscriptionContext();
};
