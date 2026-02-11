

import React from "react";
import WheelSelector from "@/components/onboarding/wheel-selector/WheelSelector";

interface MetricHeightSelectorProps {
  heightValues: Array<{ label: string; value: number }>;
  heightCm: number;
  onHeightChange: (value: number) => void;
}

const MetricHeightSelector: React.FC<MetricHeightSelectorProps> = ({
  heightValues,
  heightCm,
  onHeightChange
}) => {
  return (
    <div className="space-y-2 w-full flex flex-col items-center" data-no-swipe-back="true">
      {/* Label moved to parent for alignment */}
      <div className="h-[200px] w-24">
        {heightValues.length > 0 && (
          <WheelSelector
            values={heightValues}
            onChange={onHeightChange}
            initialValue={heightCm}
            className="w-full"
            labelClassName="text-xl font-medium"
            itemHeight={50}
            visibleItems={5}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(MetricHeightSelector);