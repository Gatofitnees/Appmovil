
import React, { useRef, useEffect } from "react";
import { NumericInput } from "@/components/ui/numeric-input";
import { cn } from "@/lib/utils";
import { WorkoutSet } from "../../types/workout";
import { RIRInfoModal } from "./RIRInfoModal";

interface SetRowProps {
  set: WorkoutSet;
  exerciseIndex: number;
  setIndex: number;
  showAuto?: boolean;
  onInputChange: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps' | 'rir' | 'partial_reps', value: string) => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  exerciseIndex,
  setIndex,
  showAuto = false,
  onInputChange
}) => {
  const repsInputRef = useRef<HTMLInputElement>(null);
  const partialInputRef = useRef<HTMLInputElement>(null);
  const [isPartialsExpanded, setIsPartialsExpanded] = React.useState((set.partial_reps ?? null) !== null);
  const [isRirModalOpen, setIsRirModalOpen] = React.useState(false);

  useEffect(() => {
    if ((set.partial_reps ?? null) !== null) {
      setIsPartialsExpanded(true);
    }
  }, [set.partial_reps]);

  const hasPartials = isPartialsExpanded || (set.partial_reps ?? null) !== null;

  // When partial reps gets activated, auto-focus the partial input
  useEffect(() => {
    if (hasPartials && partialInputRef.current && (set.partial_reps ?? null) === 0) {
      // Focus immediately without delay to prevent keyboard flicker
      partialInputRef.current?.click();
      partialInputRef.current?.focus();
    }
  }, [hasPartials, set.partial_reps]);

  // Generate target reps placeholder text
  const getTargetRepsPlaceholder = () => {
    if (set.target_reps_range) {
      return set.target_reps_range;
    }
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
    if (typeof weight === 'string') return weight;
    if (typeof weight === 'number') {
      if (weight % 1 === 0) return weight.toString();
      return weight.toFixed(1);
    }
    return '';
  };

  // Format previous/auto data display in the second column
  const renderAntAutoData = () => {
    if (showAuto) {
      if (!set.target_reps_min && !set.target_reps_max && !set.target_reps_range) {
        return <span>-</span>;
      }

      let repsText = set.target_reps_range || "reps";
      if (!set.target_reps_range && set.target_reps_min && set.target_reps_max) {
        if (set.target_reps_min === set.target_reps_max) {
          repsText = `${set.target_reps_min} reps`;
        } else {
          repsText = `${set.target_reps_min}-${set.target_reps_max} reps`;
        }
      } else if (!set.target_reps_range && set.target_reps_min && !set.target_reps_max) {
        repsText = `${set.target_reps_min}+ reps`;
      }

      return (
        <div className="flex flex-col text-center w-full justify-center">
          <span className="text-sm font-medium text-foreground leading-tight">{repsText}</span>
          <span className="text-xs text-muted-foreground mt-0.5">
            {set.target_rir !== null && set.target_rir !== undefined ? `${set.target_rir} RIR` : '-'}
          </span>
        </div>
      );
    }

    // Previous mode
    if (set.previous_weight !== null && set.previous_reps !== null) {
      const formattedWeight = typeof set.previous_weight === 'number'
        ? (set.previous_weight % 1 === 0 ? set.previous_weight.toString() : set.previous_weight.toFixed(1))
        : set.previous_weight;

      return (
        <div className="flex flex-col text-center w-full justify-center">
          <span className="text-sm font-medium text-foreground leading-tight">
            {formattedWeight}kg × {set.previous_reps}
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">
            {set.previous_rir !== null && set.previous_rir !== undefined ? `${set.previous_rir} RIR` : '-'}
          </span>
        </div>
      );
    }
    return <span>-</span>;
  };

  return (
    <>
      <div
        className="bg-background/50 rounded-lg border border-white/5 p-2"
        id={exerciseIndex === 0 && setIndex === 0 ? "tutorial-set-input" : undefined}
      >
        <div className="grid grid-cols-4 gap-2">
          {/* Serie column */}
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center text-sm">
              {set.set_number}
            </div>
          </div>

          {/* Anterior column */}
          <div className="text-xs text-muted-foreground flex items-center justify-center">
            {renderAntAutoData()}
          </div>

          {/* Peso column — no RIR/Partial props, gets the default plain keyboard */}
          <div>
            <NumericInput
              className="w-full h-8 text-sm !ring-offset-0 focus:border-transparent focus-visible:border-transparent transition-colors"
              value={formatWeightDisplay(set.weight)}
              onChange={(e) => onInputChange(exerciseIndex, setIndex, 'weight', e.target.value)}
              placeholder="kg"
              allowDecimals={true}
              maxDecimals={1}
              showWeightControls={true}
              hasPreviousWeight={set.previous_weight !== null}
              onCopyPreviousWeight={() => {
                if (set.previous_weight !== null) {
                  onInputChange(exerciseIndex, setIndex, 'weight', set.previous_weight.toString());
                }
              }}
              onAdjustWeight={(amount) => {
                const currentWeight = typeof set.weight === 'number' ? set.weight : parseFloat(set.weight as string) || 0;
                const newWeight = Math.max(0, currentWeight + amount);
                onInputChange(exerciseIndex, setIndex, 'weight', newWeight.toString());
              }}
            />
          </div>

          {/* Reps column with RIR and Partials */}
          <div className="relative w-full h-full">
            <div className={cn(
              "flex items-stretch h-8 rounded-md gap-0 transition-colors border",
              hasPartials
                ? "ring-2 ring-primary border-transparent"
                : "border-input bg-background focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
            )}>
              {/* Reps input — always shown */}
              <NumericInput
                ref={repsInputRef}
                className={cn(
                  "border-none h-full p-0 text-center flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 !ring-0 min-w-0 px-1 text-sm md:text-sm",
                  hasPartials ? "bg-[#1C1C1E]/50 border-r border-[#1C1C1E] !rounded-l-md !rounded-r-none" : "bg-transparent !rounded-md"
                )}
                value={set.reps !== null ? set.reps : ''}
                onChange={(e) => onInputChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                placeholder={getTargetRepsPlaceholder()}
                allowDecimals={false}
                showRIR={true}
                showPartials={true}
                partialButtonLabel="P"
                activeRIR={set.rir ?? null}
                onRirInfoClick={() => setIsRirModalOpen(true)}
                onRIRSelect={(val) => onInputChange(exerciseIndex, setIndex, 'rir', val === null ? '' : val.toString())}
                onFailureToggle={() => {
                  if (set.rir === 0 || set.rir === '0') {
                    onInputChange(exerciseIndex, setIndex, 'rir', '');
                  } else {
                    onInputChange(exerciseIndex, setIndex, 'rir', '0');
                  }
                }}
                isFailureActive={set.rir === 0 || set.rir === '0'}
                onPartialToggle={() => {
                  // Activate partials: sets partial_reps to 0 and focus will shift automatically
                  setIsPartialsExpanded(true);
                  if ((set.partial_reps ?? null) === null) {
                    onInputChange(exerciseIndex, setIndex, 'partial_reps', '0');
                  }
                }}
                isPartialActive={hasPartials}
                leftButtonOverride={hasPartials ? {
                  label: 'F',
                  active: true,
                  onClick: () => { }
                } : undefined}
                rightButtonOverride={hasPartials ? {
                  label: 'P',
                  active: false,
                  onClick: () => {
                    partialInputRef.current?.click();
                    partialInputRef.current?.focus();
                  }
                } : undefined}
              />

              {/* Partial reps input — shown when partials are active */}
              {hasPartials && (
                <NumericInput
                  ref={partialInputRef}
                  className="border-none bg-black/20 h-full p-0 text-center flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 !ring-0 !rounded-r-md !rounded-l-none text-white px-1 text-sm md:text-sm"
                  value={(set.partial_reps ?? '').toString()}
                  onChange={(e) => onInputChange(exerciseIndex, setIndex, 'partial_reps', e.target.value)}
                  placeholder="0"
                  allowDecimals={false}
                  showRIR={true}
                  showPartials={true}
                  partialButtonLabel="R"
                  activeRIR={set.rir ?? null}
                  onRirInfoClick={() => setIsRirModalOpen(true)}
                  onRIRSelect={(val) => onInputChange(exerciseIndex, setIndex, 'rir', val === null ? '' : val.toString())}
                  onFailureToggle={() => {
                    if (set.rir === 0 || set.rir === '0') {
                      onInputChange(exerciseIndex, setIndex, 'rir', '');
                    } else {
                      onInputChange(exerciseIndex, setIndex, 'rir', '0');
                    }
                  }}
                  isFailureActive={set.rir === 0 || set.rir === '0'}
                  isPartialActive={true}
                  leftButtonOverride={{
                    label: 'F',
                    active: false,
                    onClick: () => {
                      // Sync focus reps to switch the keyboard instantly and safely
                      repsInputRef.current?.click();
                      repsInputRef.current?.focus();

                      // Delay the DOM unmount to prevent ghost clicks (click event bubbling into the new element)
                      setTimeout(() => {
                        setIsPartialsExpanded(false);
                        const val = (set.partial_reps ?? '').toString();
                        if (val === '' || val === '0') {
                          onInputChange(exerciseIndex, setIndex, 'partial_reps', '');
                        }
                      }, 150);
                    }
                  }}
                  rightButtonOverride={{
                    label: 'P',
                    active: true,
                    onClick: () => { }
                  }}
                />
              )}
            </div>

            {/* RIR Badge */}
            {(set.rir ?? null) !== null && (
              <div
                className={cn(
                  "absolute -right-1 -bottom-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg border border-black/20 z-10",
                  set.rir === 0 && "bg-red-600",
                  set.rir === 1 && "bg-red-500",
                  set.rir === 2 && "bg-orange-500",
                  set.rir === 3 && "bg-yellow-500",
                  set.rir === 4 && "bg-green-500",
                  set.rir === 5 && "bg-green-600",
                  (set.rir === 6 || (set.rir ?? '').toString() === "6+") && "bg-blue-600"
                )}
              >
                {set.rir}
              </div>
            )}
          </div>
        </div>
      </div>

      <RIRInfoModal
        isOpen={isRirModalOpen}
        onClose={() => setIsRirModalOpen(false)}
      />
    </>
  );
};
