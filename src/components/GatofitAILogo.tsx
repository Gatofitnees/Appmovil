
import React from "react";
import { cn } from "@/lib/utils";

interface GatofitAILogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const GatofitAILogo: React.FC<GatofitAILogoProps> = ({ 
  className,
  size = "md"
}) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl"
  };

  return (
    <h1 className={cn(
      "font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-600 to-blue-500 animate-galaxy-pulse animate-galaxy-glow", 
      sizeClasses[size],
      className
    )}>
      Gatofit
    </h1>
  );
};

export default GatofitAILogo;
