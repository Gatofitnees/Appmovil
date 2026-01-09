
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RankingUser {
  user_id: string;
  username: string;
  avatar_url: string | null;
  current_streak: number;
  total_experience: number;
  current_level: number;
  rank_name: string;
  total_workouts?: number;
  followers_count?: number;
  following_count?: number;
}

export type RankingType = 'streak' | 'experience';

export const useRankings = (limit?: number, coachId?: string | null) => {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async (type: RankingType = 'streak', customLimit?: number, passedCoachId?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check current user authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw new Error('Error de autenticación');
      }

      // First get all public profiles
      const { data: profiles, error: profilesError } = await (supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, is_profile_public')
        .eq('is_profile_public', true) as any);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('👥 Public profiles found:', profiles?.length);

      if (!profiles || profiles.length === 0) {
        console.warn('⚠️ No public profiles found');
        setRankings([]);
        return;
      }

      // Filter by coach if coachId is provided
      let userIdsToFetch = profiles.map(p => p.id);

      const effectiveCoachId = passedCoachId || coachId;
      if (effectiveCoachId) {
        console.log('🔍 Filtering by coachId:', effectiveCoachId);
        // Get all users assigned to the same coach
        const { data: coachUsers, error: coachUsersError } = await supabase
          .from('coach_user_assignments')
          .select('user_id')
          .eq('coach_id', effectiveCoachId);

        if (coachUsersError) {
          console.error('❌ Error fetching coach users:', coachUsersError);
        }

        if (coachUsers && coachUsers.length > 0) {
          const coachUserIds = coachUsers.map(cu => cu.user_id);
          console.log('📋 Coach user mapping found:', coachUserIds.length, 'users');
          userIdsToFetch = userIdsToFetch.filter(id => coachUserIds.includes(id));
        } else {
          console.warn('⚠️ No users found for this coach assignment');
          userIdsToFetch = [];
        }
      }

      console.log('🎯 Final userIds to fetch streaks for:', userIdsToFetch.length);

      if (userIdsToFetch.length === 0) {
        setRankings([]);
        return;
      }

      // Then get streak data for these users with enhanced logging
      // Batch fetch streaks to avoid URL too long error (400)
      const BATCH_SIZE = 50;
      const streakPromises = [];

      for (let i = 0; i < userIdsToFetch.length; i += BATCH_SIZE) {
        const batch = userIdsToFetch.slice(i, i + BATCH_SIZE);
        streakPromises.push(
          supabase
            .from('user_streaks')
            .select('user_id, current_streak, total_experience, current_level')
            .in('user_id', batch)
        );
      }

      const streakResults = await Promise.all(streakPromises);

      const streaks: any[] = [];

      for (const result of streakResults) {
        if (result.error) {
          throw result.error;
        }
        if (result.data) {
          streaks.push(...result.data);
        }
      }

      // Filter profiles to only include those in userIdsToFetch
      const filteredProfiles = profiles.filter(p => userIdsToFetch.includes(p.id));

      // Transform and combine the data
      const transformedData = filteredProfiles.map((profile) => {
        const streakData = streaks?.find(s => s.user_id === profile.id);
        const displayName = profile.username || profile.full_name || `Usuario #${profile.id.substring(0, 8)}`;

        const user: RankingUser = {
          user_id: profile.id,
          username: displayName,
          avatar_url: profile.avatar_url,
          current_streak: streakData?.current_streak || 0,
          total_experience: streakData?.total_experience || 0,
          current_level: streakData?.current_level || 1,
          rank_name: 'Gatito Novato',
          total_workouts: 0,
          followers_count: 0,
          following_count: 0
        };

        return user;
      });

      // Sort users based on the selected type
      const sortedData = transformedData.sort((a, b) => {
        if (type === 'streak') {
          return b.current_streak - a.current_streak;
        } else {
          return b.total_experience - a.total_experience;
        }
      });

      // Apply limit if specified
      const finalLimit = customLimit || limit;
      const limitedData = finalLimit ? sortedData.slice(0, finalLimit) : sortedData;

      setRankings(limitedData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clasificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings('streak', limit, coachId);
  }, [coachId]);

  return {
    rankings,
    isLoading,
    error,
    fetchRankings
  };
};
