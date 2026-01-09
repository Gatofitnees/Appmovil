
import React from "react";
import { NumericInput } from "@/components/ui/numeric-input";

interface WorkoutSet {
  set_number: number;
  weight: number | string | null;
  reps: number | null;
  notes: string;
  previous_weight: number | null;
  previous_reps: number | null;
  target_reps_min?: number;
  target_reps_max?: number;
  target_reps_range?: string;
}

interface SetRowProps {
  set: WorkoutSet;
  exerciseIndex: number;
  setIndex: number;
  onInputChange: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  exerciseIndex,
  setIndex,
  onInputChange
}) => {
  // Generate target reps placeholder text
  const getTargetRepsPlaceholder = () => {
    // Prioritize reps_range if available (e.g., "4-6-8")
    if (set.target_reps_range) {
      return set.target_reps_range;
    }

    // Otherwise, build from min-max
    if (set.target_reps_min && set.target_reps_max) {
      if (set.target_reps_min === set.target_reps_max) {
        return set.target_reps_min.toString();
      } else {
        return `${set.target_reps_min}-${set.target_reps_max}`;
      }
    }
    return "reps";
  };

  // Format weight display with proper decimal formatting
  const formatWeightDisplay = (weight: number | string | null) => {
    if (weight === null) return '';

    // If it's a string (like "12."), return as is to preserve trailing dots
    if (typeof weight === 'string') {
      return weight;
    }

    // If it's a number, format it properly
    if (typeof weight === 'number') {
      // Show decimals only if they're not zero
      if (weight % 1 === 0) {
        return weight.toString();
      } else {
        return weight.toFixed(1); // Show only 1 decimal place
      }
    }

    return '';
  };

  // Format previous data display
  const formatPreviousData = () => {
    console.log(`SetRow ${setIndex} - Previous data:`, {
      weight: set.previous_weight,
      reps: set.previous_reps
    });

    if (set.previous_weight !== null && set.previous_reps !== null) {
      const formattedWeight = typeof set.previous_weight === 'number'
        ? (set.previous_weight % 1 === 0 ? set.previous_weight.toString() : set.previous_weight.toFixed(1))
        : set.previous_weight;
      return `${formattedWeight}kg × ${set.previous_reps}`;
    }
    return '-';
  };

  return (
    <div className="bg-background/50 rounded-lg border border-white/5 p-2">
      <div className="grid grid-cols-4 gap-2">
        {/* Serie column */}
        <div className="flex items-center">
          <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center text-sm">
            {set.set_number}
          </div>
        </div>

        {/* Anterior column */}
        <div className="text-xs text-muted-foreground flex items-center">
          {formatPreviousData()}
        </div>

        {/* Peso column - with decimal support (max 1 decimal) */}
        <div>
          <NumericInput
            className="w-full h-8 text-sm"
            value={formatWeightDisplay(set.weight)}
            onChange={(e) => onInputChange(exerciseIndex, setIndex, 'weight', e.target.value)}
            placeholder="kg"
            allowDecimals={true}
            maxDecimals={1}
          />
        </div>

        {/* Reps column with target reps as placeholder */}
        <div>
          <NumericInput
            className="w-full h-8 text-sm"
            value={set.reps !== null ? set.reps : ''}
            onChange={(e) => onInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
            placeholder={getTargetRepsPlaceholder()}
            allowDecimals={false}
          />
        </div>
      </div>
    </div>
  );
};
