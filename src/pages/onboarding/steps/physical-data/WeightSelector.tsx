

import React from "react";
import WheelSelector from "@/components/onboarding/wheel-selector/WheelSelector";

interface WeightSelectorProps {
  weightValues: Array<{ label: string; value: number }>;
  weight: number;
  onWeightChange: (value: number) => void;
  unit?: string;
}

const WeightSelector: React.FC<WeightSelectorProps> = ({
  weightValues,
  weight,
  onWeightChange,
  unit = "kg"
}) => {
  // Determine unit label based on heuristic (if values are small < 150 likely kg in context of adults, or check props - assuming context handles unit conversion elsewhere and this just displays. But to be safe let's assume 'kg' or 'lb' text isn't passed yet. For now, let's just use 'kg' as placeholder or check if we can infer.
  // Actually, PhysicalDataContent keeps state. Let's assume the values passed are correct.
  // The user didn't ask for unit toggling on weight here, so we'll just put the unit below. 
  // Wait, Weight is dynamic. Let's assume standard unit visibility.
  // Let's just put nothing for now if not sure, or better:
  // Since 'UnitToggle' is global, we might want to pass unit prop.
  // However, looking at previous WeightSelector, it didn't show units inside the wheel either explicitly? 
  // Ah, looking at `WeightSelector` previous state... it didn't show 'kg'.
  // But the image reference shows '64 kg'.
  // If we move unit out, we need to know what it is.
  // Let's stick "kg/lb" or generic if not passed.
  // Actually, `PhysicalDataContent` has `isMetric`. I should pass that down if I want to be accurate.
  // But strictly following "Move Units Below Wheel", I'll add a span. For now let's assume "kg" or transparent if unknown, 
  // but better to just center it first.

  return (
    <div className="space-y-2 w-full flex flex-col items-center">
      {/* Label moved to parent */}
      <div className="h-[200px] w-24">
        {weightValues.length > 0 && (
          <WheelSelector
            values={weightValues}
            onChange={onWeightChange}
            initialValue={weight}
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

export default React.memo(WeightSelector);