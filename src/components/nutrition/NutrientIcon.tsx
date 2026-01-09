import React from 'react';
import { FlatIcon } from '@/components/ui/FlatIcon';
import { cn } from '@/lib/utils';

interface NutrientIconProps {
  type: 'calories' | 'protein' | 'carbs' | 'fat';
  value: number;
  unit?: string;
  className?: string;
}

const NutrientIcon: React.FC<NutrientIconProps> = React.memo(({
  type,
  value,
  unit = 'g',
  className
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'calories':
        return {
          icon: '/flame.svg',
          isImage: true,
          color: 'white',
          bgColor: 'bg-secondary/30',
          unit: 'kcal'
        };
      case 'protein':
        return {
          icon: 'sr-drumstick',
          color: '#dd6969',
          bgColor: 'bg-secondary/30',
          unit: 'g'
        };
      case 'carbs':
        return {
          icon: 'sr-wheat',
          color: '#EB9F6D',
          bgColor: 'bg-secondary/30',
          unit: 'g'
        };
      case 'fat':
        return {
          icon: 'sr-avocado',
          color: '#6C95DC',
          bgColor: 'bg-secondary/30',
          unit: 'g'
        };
      default:
        return {
          icon: 'sr-circle',
          color: '#6b7280',
          bgColor: 'bg-secondary/30',
          unit: 'g'
        };
    }
  };

  const config = getIconConfig();
  const roundedValue = Math.round(value);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center",
        config.bgColor
      )}>
        {/* @ts-ignore - straightforward check */}
        {config.isImage ? (
          <img
            src={config.icon}
            alt="Cal"
            className="w-3.5 h-3.5 brightness-0 invert -translate-y-0.5"
          />
        ) : (
          <FlatIcon
            name={config.icon}
            size={12}
            style={{ color: config.color, transform: 'translateY(1px)' }}
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">
          {roundedValue}
        </span>
        <span className="text-xs text-muted-foreground leading-none">
          {unit === 'g' ? config.unit : unit}
        </span>
      </div>
    </div>
  );
});

export default NutrientIcon;