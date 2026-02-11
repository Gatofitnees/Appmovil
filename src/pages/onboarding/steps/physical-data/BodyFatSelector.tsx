

import React from "react";
import WheelSelector from "@/components/onboarding/wheel-selector/WheelSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BodyFatSelectorProps {
  fatValues: Array<{ label: string; value: number }>;
  bodyFat: number;
  onBodyFatChange: (value: number) => void;
}

const BodyFatSelector: React.FC<BodyFatSelectorProps> = ({
  fatValues,
  bodyFat,
  onBodyFatChange
}) => {
  return (
    <div className="space-y-2 w-full flex flex-col items-center" data-no-swipe-back="true">
      {/* Header moved to parent */}
      <div className="h-[200px] w-24">
        {fatValues.length > 0 && (
          <WheelSelector
            values={fatValues}
            onChange={onBodyFatChange}
            initialValue={bodyFat}
            className="w-full"
            labelClassName="text-xl font-medium whitespace-nowrap"
            itemHeight={50}
            visibleItems={5}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(BodyFatSelector);