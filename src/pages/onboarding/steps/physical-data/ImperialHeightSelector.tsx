
import React from "react";
import WheelSelector from "@/components/onboarding/wheel-selector/WheelSelector";

interface ImperialHeightSelectorProps {
  heightValues: Array<{ label: string; value: number }>;
  inchesValues: Array<{ label: string; value: number }>;
  heightFt: number;
  heightIn: number;
  onHeightFtChange: (value: number) => void;
  onHeightInChange: (value: number) => void;
}

const ImperialHeightSelector: React.FC<ImperialHeightSelectorProps> = ({
  heightValues,
  inchesValues,
  heightFt,
  heightIn,
  onHeightFtChange,
  onHeightInChange
}) => {
  return (
    <div className="space-y-2 w-full">
      {/* Label moved to parent */}
      <div className="flex justify-center gap-4 h-[200px]">
        <div className="flex flex-col items-center w-20">
          <div className="h-full w-full">
            {heightValues.length > 0 && (
              <WheelSelector
                values={heightValues}
                onChange={onHeightFtChange}
                initialValue={heightFt}
                className="w-full"
                labelClassName="text-xl font-medium"
                itemHeight={50}
                visibleItems={5}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center w-20">
          <div className="h-full w-full">
            {inchesValues.length > 0 && (
              <WheelSelector
                values={inchesValues}
                onChange={onHeightInChange}
                initialValue={heightIn}
                className="w-full"
                labelClassName="text-xl font-medium"
                itemHeight={50}
                visibleItems={5}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ImperialHeightSelector);
