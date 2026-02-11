
import React from "react";
import WheelSelector from "@/components/onboarding/wheel-selector/WheelSelector";

interface DateSelectorsProps {
  day: number;
  month: number;
  year: number;
  setDay: (day: number) => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  daysValues: Array<{ label: string; value: number }>;
  monthsValues: Array<{ label: string; value: number }>;
  yearsValues: Array<{ label: string; value: number }>;
}

const DateSelectors: React.FC<DateSelectorsProps> = ({
  day,
  month,
  year,
  setDay,
  setMonth,
  setYear,
  daysValues,
  monthsValues,
  yearsValues,
}) => {
  return (
    <div className="flex space-x-2 h-[240px] mb-8" data-no-swipe-back="true">
      <div className="w-1/3">
        {daysValues.length > 0 && (
          <WheelSelector
            values={daysValues}
            onChange={(value) => setDay(value)}
            initialValue={day}
            className="h-full"
            labelClassName="text-xl font-medium"
            itemHeight={45}
            visibleItems={5}
          />
        )}
      </div>
      <div className="w-1/3">
        {monthsValues.length > 0 && (
          <WheelSelector
            values={monthsValues}
            onChange={(value) => setMonth(value)}
            initialValue={month}
            className="h-full"
            labelClassName="text-xl font-medium"
            itemHeight={45}
            visibleItems={5}
          />
        )}
      </div>
      <div className="w-1/3">
        {yearsValues.length > 0 && (
          <WheelSelector
            values={yearsValues}
            onChange={(value) => setYear(value)}
            initialValue={year}
            className="h-full"
            labelClassName="text-xl font-medium"
            itemHeight={45}
            visibleItems={5}
          />
        )}
      </div>
    </div>
  );
};

export default DateSelectors;
