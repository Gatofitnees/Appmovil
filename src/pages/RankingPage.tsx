
import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { LottieIcon } from "@/components/ui/LottieIcon";
import { StreakShieldIcon } from "@/components/streak/StreakShieldIcon";
import fireAnimation from '@/assets/lottie/fuego_racha.lottie';
import { Card, CardBody } from '@/components/Card';
import { Button } from '@/components/ui/button';
import RankingList from '@/components/RankingList';
import { useStreaks } from '@/hooks/useStreaks';
import { useRankings, RankingType } from '@/hooks/useRankings';
import { useBranding } from '@/contexts/BrandingContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useCoachAssignment } from '@/hooks/useCoachAssignment';

import { StreakShieldModal } from "@/components/streak/StreakShieldModal";

const RankingPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<RankingType>('streak');
  const [showShieldModal, setShowShieldModal] = useState(false);
  const { streakData, isLoading: streakLoading } = useStreaks();
  const { rankings, isLoading: rankingsLoading, fetchRankings } = useRankings(20);
  const { branding, loading: brandingLoading } = useBranding();
  const { coachId, loading: coachLoading } = useCoachAssignment();

  // Refetch rankings when coachId is available
  useEffect(() => {
    if (!coachLoading) {
      fetchRankings(selectedType, 20, coachId);
    }
  }, [coachId, coachLoading]);

  const handleTypeChange = (type: RankingType) => {
    setSelectedType(type);
    fetchRankings(type, 20, coachId);
  };

  return (
    <div className="min-h-screen pb-24 px-4 max-w-md mx-auto" style={{ paddingTop: 'calc(max(var(--safe-area-inset-top), 50px) + 1.5rem)' }}>
      <h1 className="text-xl font-bold mb-6">Ranking</h1>

      {/* Compact Streak Card with Animated Background */}
      <Card className="mb-6 relative overflow-hidden border-orange-200/20">
        {brandingLoading ? (
          <CardBody className="py-4">
            <Skeleton className="w-full h-20" />
          </CardBody>
        ) : (
          <>
            {/* Animated GIF Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${branding.rankingImageUrl}')`
              }}
            />

            {/* Content */}
            <CardBody className="py-4 relative z-10">
              <div className="flex flex-col items-start ml-4">
                <div className="flex items-center gap-3 mb-2">
                  <LottieIcon
                    src={fireAnimation}
                    width={40}
                    height={40}
                    className="-ml-1 -mt-0.5 flex-shrink-0"
                  />
                  <span className="text-3xl font-bold text-orange-500 drop-shadow-lg filter brightness-125">
                    {streakLoading ? '...' : streakData?.current_streak || 0}
                  </span>

                </div>
                <span className="text-lg font-semibold text-orange-400 drop-shadow-lg filter brightness-125">
                  Racha Actual
                </span>
              </div>

              {/* Streak Freeze Shield - Top Right Positioned */}
              {(streakData?.streak_freezes !== undefined) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShieldModal(true);
                  }}
                  className="absolute top-1 right-1 z-50 flex items-center gap-1 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30 backdrop-blur-md hover:bg-blue-500/30 transition-all active:scale-95"
                >
                  <StreakShieldIcon width={14} height={14} className="flex-shrink-0" />
                  <span className="text-xs font-bold text-blue-300 drop-shadow-md">
                    {streakData.streak_freezes}
                  </span>
                </button>
              )}
            </CardBody>
          </>
        )}
      </Card>

      {/* Classification Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedType === 'streak' ? 'default' : 'outline'}
          onClick={() => handleTypeChange('streak')}
          className="flex-1"
          size="sm"
        >
          <Flame className="h-4 w-4 mr-2" />
          Rachas
        </Button>
        <Button
          variant={selectedType === 'experience' ? 'default' : 'outline'}
          onClick={() => handleTypeChange('experience')}
          className="flex-1"
          size="sm"
        >
          ⭐ Experiencia
        </Button>
      </div>

      {/* Rankings List */}
      <Card>
        <CardBody>
          <div className="mb-4">
            <h3 className="font-semibold">
              {selectedType === 'streak' ? 'Mejores Rachas' : 'Mayor Experiencia'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedType === 'streak'
                ? 'Top 20 usuarios con las rachas más largas'
                : 'Top 20 usuarios con más experiencia acumulada'
              }
            </p>
          </div>

          <RankingList
            users={rankings}
            type={selectedType}
            isLoading={rankingsLoading}
          />
        </CardBody>
      </Card>

      <StreakShieldModal
        open={showShieldModal}
        onOpenChange={setShowShieldModal}
        freezeCount={streakData?.streak_freezes || 0}
        maxCapacity={streakData?.max_freezes_capacity || 3}
      />
    </div>
  );
};

export default RankingPage;
