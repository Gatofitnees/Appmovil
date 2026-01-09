
import React from "react";
import { cn, formatMacroValue } from "@/lib/utils";
import MacroRing from "./MacroRing";

import { FlatIcon } from "./ui/FlatIcon";

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  color?: string;
  unit?: string;
  className?: string;
  icon?: "calories" | "protein" | "carbs" | "fat";
}

const MacroProgress: React.FC<MacroProgressProps> = ({
  label,
  current,
  target,
  color = "primary",
  unit = "g",
  className,
  icon
}) => {
  const progress = Math.min(100, Math.max(0, (current / target) * 100));

  const colorClasses = {
    primary: "bg-[#2094F3]",
    protein: "bg-[#dd6969]",
    carbs: "bg-[#EB9F6D]",
    fat: "bg-[#6C95DC]"
  };

  const getIcon = () => {
    switch (icon) {
      case "calories":
        return <img src="/flame.svg" alt="Calories" className="w-4 h-4 brightness-0 invert -translate-y-0.5" />;
      case "protein":
        return <FlatIcon name="sr-drumstick" style={{ color: '#dd6969' }} size={16} />;
      case "carbs":
        return <FlatIcon name="sr-wheat" style={{ color: '#EB9F6D' }} size={16} />;
      case "fat":
        return <FlatIcon name="sr-avocado" style={{ color: '#6C95DC' }} size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          {icon && <span className="mr-1.5">{getIcon()}</span>}
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-medium">
          {formatMacroValue(current)} / {formatMacroValue(target)} {unit}
        </span>
      </div>
      <div className="h-2 relative w-full bg-secondary/50 overflow-hidden rounded-full">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClasses[color as keyof typeof colorClasses] || colorClasses.primary)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default MacroProgress;
