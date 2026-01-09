import { useStreakContext, UserStreak } from '@/contexts/StreakContext';

export type { UserStreak };

export const useStreaks = () => {
  return useStreakContext();
};
