
import React, { useState, useEffect } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface NeuSliderProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number[];
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
}

const NeuSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, NeuSliderProps>(
  ({ min = 0, max = 100, step = 1, defaultValue, value, onValueChange, className }, ref) => {
    const [localValue, setLocalValue] = useState(defaultValue || value || [50]);

    useEffect(() => {
      if (value !== undefined) {
        setLocalValue(value);
      }
    }, [value]);

    const handleChange = (newValue: number[]) => {
      setLocalValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    return (
      <SliderPrimitive.Root
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value !== undefined ? value : localValue}
        onValueChange={handleChange}
        defaultValue={defaultValue}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full bg-primary shadow-sm border-2 border-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    );
  }
);

NeuSlider.displayName = "NeuSlider";

export default NeuSlider;
