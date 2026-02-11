
import React from 'react';
import { useRankSystem } from '@/contexts/RankSystemContext';

interface RankBadgeProps {
  level: number;
  showIcon?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLevelNumber?: boolean;
  showLevelWithRank?: boolean; // New prop for "Nivel X • Rango" format
}

const RankBadge: React.FC<RankBadgeProps> = ({
  level,
  showIcon = true,
  showName = true,
  size = 'md',
  showLevelNumber = false,
  showLevelWithRank = false
}) => {
  const { getRank } = useRankSystem();
  const rank = getRank(level);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center gap-1 ${sizeClasses[size]}`}>
      {showLevelWithRank ? (
        <span className={`font-medium ${rank.textColor} ${iconSizes[size]}`}>
          Nivel {level} • {rank.name}
        </span>
      ) : showLevelNumber ? (
        <span className={`font-bold ${rank.textColor} ${iconSizes[size]}`}>
          Nivel {level}
        </span>
      ) : (
        <>
          {showIcon && (
            <span className={iconSizes[size]}>{rank.icon}</span>
          )}
          {showName && (
            <span className={`font-medium ${rank.textColor}`}>
              {rank.name}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default RankBadge;
