
import React from 'react';
import { Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimits } from '@/hooks/useUsageLimits';

interface UsageLimitsBannerProps {
  type: 'routines' | 'nutrition' | 'ai_chat';
  className?: string;
  refreshKey?: number;
}

export const UsageLimitsBanner: React.FC<UsageLimitsBannerProps> = ({
  type,
  className = '',
  refreshKey = 0
}) => {
  const { isPremium, isLoading } = useSubscription();
  const { usage } = useUsageLimits();

  if (isLoading || isPremium || !usage) return null;

  const getUsageInfo = () => {
    switch (type) {
      case 'routines':
        return {
          current: usage.routines_created,
          limit: 3
        };
      case 'nutrition':
        return {
          current: usage.nutrition_photos_used,
          limit: 5
        };
      case 'ai_chat':
        return {
          current: usage.ai_chat_messages_used,
          limit: 3
        };
    }
  };

  const usageInfo = getUsageInfo();
  const isNearLimit = usageInfo.current >= usageInfo.limit * 0.8;
  const isAtLimit = usageInfo.current >= usageInfo.limit;

  return (
    <div
      key={`${type}-${refreshKey}-${usageInfo.current}`}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${isAtLimit
        ? 'bg-red-100 text-red-700 border border-red-200'
        : isNearLimit
          ? 'bg-orange-100 text-orange-700 border border-orange-200'
          : 'bg-blue-100 text-blue-700 border border-blue-200'
        } ${className}`}>
      <Crown className={`h-3 w-3 ${isAtLimit
        ? 'text-red-500'
        : isNearLimit
          ? 'text-orange-500'
          : 'text-blue-500'
        }`} />
      <span>
        {usageInfo.current}/{usageInfo.limit}
      </span>
    </div>
  );
};
