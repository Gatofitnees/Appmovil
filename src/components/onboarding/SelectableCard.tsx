
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SelectableCardProps {
  selected: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  className?: string;
}

const SelectableCard: React.FC<SelectableCardProps> = ({
  selected,
  onSelect,
  icon,
  label,
  children,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all duration-200 border",
        selected
          ? "bg-primary/10 border-primary"
          : "bg-secondary/20 border-white/5 hover:bg-secondary/30",
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        {icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              selected ? "bg-primary text-white" : "bg-secondary/30 text-muted-foreground"
            )}
          >
            {icon}
          </div>
        )}
        <h3 className="h3">{label}</h3>
        {children}
      </div>
    </motion.div>
  );
};

export default SelectableCard;
