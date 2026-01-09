
import { cn } from "@/lib/utils";

// Helper for wheel item container styles
export const getWheelItemContainerStyles = (isSelected: boolean) => {
  return cn(
    "absolute left-0 w-full flex items-center justify-center cursor-pointer transition-opacity duration-200",
    isSelected ? "text-primary font-medium" : "text-muted-foreground"
  );
};

// Helper for wheel item label styles
export const getWheelItemLabelStyles = (labelClassName?: string) => {
  return cn(
    "select-none text-center px-1 transition-opacity duration-150",
    labelClassName
  );
};

// Helper for wheel container styles
export const getWheelContainerStyles = (className?: string) => {
  return cn(
    "relative overflow-hidden select-none touch-none",
    className
  );
};

// Helper for highlight styles
export const getWheelHighlightStyles = () => {
  return cn(
    "absolute left-0 top-1/2 w-full -translate-y-1/2 bg-primary/10 pointer-events-none z-10 border-y border-primary/20"
  );
};
