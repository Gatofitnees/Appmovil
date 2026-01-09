
import React from "react";
import { cn } from "@/lib/utils";

interface MacroRingProps {
  value: number;
  target: number;
  icon?: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
  unit?: string;
  showValues?: boolean;
}

const MacroRing: React.FC<MacroRingProps> = ({
  value,
  target,
  icon,
  color = "primary",
  size = "md",
  className,
  animated = true,
}) => {
  const progress = Math.min(100, Math.max(0, (value / target) * 100));

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const colorClasses = {
    primary: "text-[#2094F3]",
    protein: "text-[#dd6969]",
    carbs: "text-[#EB9F6D]",
    fat: "text-[#6C95DC]",
    white: "text-white"
  };

  const strokeWidth = size === 'sm' ? 4 : (size === 'md' ? 5 : 8);
  const radius = size === 'sm' ? 28 : (size === 'md' ? 40 : 54);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn(
      "relative flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      {/* Background ring */}
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth={strokeWidth}
          stroke="rgba(255, 255, 255, 0.1)"
          fill="none"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          className={cn(
            colorClasses[color as keyof typeof colorClasses] || colorClasses.primary,
            animated && "transition-all duration-1000 ease-out"
          )}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      {/* Center content - only icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {icon && (
          <div className="flex items-center justify-center translate-y-[2px]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MacroRing;
