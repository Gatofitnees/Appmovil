
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RankInfo, getRankFromLevel } from '@/utils/rankSystem';
import { useCoachAssignment } from '@/hooks/useCoachAssignment';

interface RankSystemContextType {
    getRank: (level: number) => RankInfo;
    loading: boolean;
    hasCustomRanks: boolean;
}

const RankSystemContext = createContext<RankSystemContextType>({
    getRank: getRankFromLevel,
    loading: true,
    hasCustomRanks: false,
});

export const RankSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { coachId, loading: coachLoading } = useCoachAssignment();
    const [customRanks, setCustomRanks] = useState<Record<string, RankInfo> | null>(null);
    const [fetchingRanks, setFetchingRanks] = useState(false);

    useEffect(() => {
        const fetchCustomRanks = async () => {
            if (!coachId) {
                setCustomRanks(null);
                return;
            }

            setFetchingRanks(true);
            try {
                const { data, error } = await supabase
                    .from('admin_users')
                    .select('custom_ranks')
                    .eq('id', coachId)
                    .single();

                if (error) {
                    console.error('Error fetching custom ranks:', error);
                    setCustomRanks(null);
                } else if (data?.custom_ranks) {
                    // Validate and cast the JSON data to Record<string, RankInfo>
                    const ranks = data.custom_ranks as unknown as Record<string, RankInfo>;
                    setCustomRanks(ranks);
                }
            } catch (error) {
                console.error('Error in fetchCustomRanks:', error);
                setCustomRanks(null);
            } finally {
                setFetchingRanks(false);
            }
        };

        if (!coachLoading) {
            fetchCustomRanks();
        }
    }, [coachId, coachLoading]);

    const getRank = (level: number): RankInfo => {
        const defaultRank = getRankFromLevel(level);

        if (customRanks && customRanks[defaultRank.name]) {
            return {
                ...defaultRank,
                ...customRanks[defaultRank.name] // Override with custom properties
            };
        }

        return defaultRank;
    };

    return (
        <RankSystemContext.Provider value={{ getRank, loading: coachLoading || fetchingRanks, hasCustomRanks: !!customRanks }}>
            {children}
        </RankSystemContext.Provider>
    );
};

export const useRankSystem = () => useContext(RankSystemContext);
