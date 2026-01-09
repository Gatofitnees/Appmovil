
import React from "react";
import { cn } from "@/lib/utils";

interface WheelHighlightProps {
  itemHeight?: number;
}

const WheelHighlight: React.FC<WheelHighlightProps> = ({ itemHeight = 40 }) => {
  return (
    <div
      className="absolute left-0 top-1/2 w-full -translate-y-1/2 bg-blue-500/20 dark:bg-blue-400/20 rounded-lg pointer-events-none z-10 backdrop-blur-[1px]"
      style={{ height: `${itemHeight}px` }}
    />
  );
};

export default WheelHighlight;
