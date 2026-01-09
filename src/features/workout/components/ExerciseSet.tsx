import React from "react";
import { Trash2 } from "lucide-react";
import { ExerciseSet as ExerciseSetType } from "../types";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExerciseSetProps {
  set: ExerciseSetType;
  setIndex: number;
  onSetUpdate: (setIndex: number, field: string, value: number) => void;
  onRemoveSet: (setIndex: number) => void;
}

const REST_TIMES = [
  { label: "30 seg", value: 30 },
  { label: "45 seg", value: 45 },
  { label: "60 seg", value: 60 },
  { label: "90 seg", value: 90 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "4 min", value: 240 },
  { label: "5 min", value: 300 }
];

const ExerciseSet: React.FC<ExerciseSetProps> = ({ set, setIndex, onSetUpdate, onRemoveSet }) => {
  const [repsValue, setRepsValue] = React.useState('');

  // Initialize reps value when component mounts or set changes
  React.useEffect(() => {
    // Only show values if they are actually set (greater than 0)
    if (set.reps_min > 0 && set.reps_max > 0) {
      if (set.reps_min === set.reps_max) {
        setRepsValue(set.reps_min.toString());
      } else {
        setRepsValue(`${set.reps_min}-${set.reps_max}`);
      }
    } else {
      setRepsValue('');
    }
  }, [set.reps_min, set.reps_max]);

  const handleRepsChange = (value: string) => {
    // Allow only numbers and hyphens
    const sanitizedValue = value.replace(/[^0-9-]/g, '');
    setRepsValue(sanitizedValue);

    if (sanitizedValue === '') {
      onSetUpdate(setIndex, "reps_min", 0);
      onSetUpdate(setIndex, "reps_max", 0);
      return;
    }

    const match = sanitizedValue.match(/^(\d+)(?:-(\d+))?$/);

    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;

      if (!isNaN(min) && !isNaN(max) && min <= max) {
        onSetUpdate(setIndex, "reps_min", min);
        onSetUpdate(setIndex, "reps_max", max);
      }
    }
  };

  const handleRepsFocus = () => {
    // Clear the input when user focuses if it's empty or has default values
    if (repsValue === '' || (set.reps_min === 0 && set.reps_max === 0)) {
      setRepsValue('');
    }
  };

  return (
    <div key={`set-${setIndex}`} className="mb-2 last:mb-0 bg-background/50 rounded-lg border border-white/5 p-2">
      <div className="grid grid-cols-[50px_1fr_85px_30px] gap-3 items-center">
        {/* Serie Indicator */}
        <div className="flex items-center justify-center">
          <div className="h-7 w-7 flex items-center justify-center bg-primary/20 text-primary rounded-full text-xs font-bold shadow-sm border border-primary/20">
            {setIndex + 1}
          </div>
        </div>

        {/* Reps Input */}
        <div className="h-8 w-full bg-zinc-950/30 rounded-md border border-white/10 px-0 flex items-center group focus-within:border-white/20 transition-colors">
          <input
            type="text"
            className="w-full h-full bg-transparent border-none text-sm text-center placeholder:text-zinc-600 outline-none text-white font-medium focus:ring-0 rounded-md"
            value={repsValue}
            onChange={(e) => handleRepsChange(e.target.value)}
            onFocus={handleRepsFocus}
            placeholder="8-12"
          />
        </div>

        {/* Rest Selector */}
        <div className="w-full">
          <Select
            value={set.rest_seconds.toString()}
            onValueChange={(value) => onSetUpdate(setIndex, "rest_seconds", parseInt(value))}
          >
            <SelectTrigger className="w-full h-8 rounded-md bg-zinc-950/30 border-white/10 text-sm px-2 text-center justify-center font-medium focus:ring-0 focus:border-white/20 transition-colors">
              <SelectValue placeholder="60 seg" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {REST_TIMES.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delete Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemoveSet(setIndex);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 transition-colors"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseSet;
