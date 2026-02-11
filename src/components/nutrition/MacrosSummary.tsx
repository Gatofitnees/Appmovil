import React from 'react';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import MacroRing from '../MacroRing';
import { FlatIcon } from '../ui/FlatIcon';

interface Macros {
  calories: { current: number; target: number; unit: string; };
  protein: { current: number; target: number; };
  carbs: { current: number; target: number; };
  fats: { current: number; target: number; };
}

interface MacrosSummaryProps {
  macros: Macros;
}

const SummaryCard = ({ children, className, onClick, delay = 0 }: { children: React.ReactNode; className?: string; onClick?: () => void; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    onClick={onClick}
    className={cn(
      "bg-card rounded-3xl p-5 border border-white/5 transition-all duration-200 cursor-pointer active:scale-[0.98] hover:bg-card/80",
      className
    )}
  >
    {children}
  </motion.div>
);

export const MacrosSummary: React.FC<MacrosSummaryProps> = React.memo(({ macros }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  // Helper to resolve display values
  const getGridDisplayValue = (current: number, target: number, unit: string = "g") => {
    if (showDetails) {
      return (
        <>
          {Math.round(current)}
          <span className="text-[10px] text-zinc-500 font-bold ml-0.5">
            /{Math.round(target)}{unit}
          </span>
        </>
      );
    }
    return <>{Math.round(target)}{unit}</>;
  };

  const toggleDetails = () => setShowDetails(prev => !prev);

  return (
    <div className="space-y-4 mb-8">
      {/* Calories Main Card */}
      <SummaryCard
        onClick={toggleDetails}
        className="flex items-center justify-between py-5 px-8 relative overflow-hidden"
      >
        {/* Glow Effect */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="flex flex-col z-10">
          <span className="text-4xl font-black text-white tracking-tight flex items-baseline">
            {showDetails ? (
              <>
                {Math.round(macros.calories.current)}
                <span className="text-xl text-zinc-500 font-bold ml-1">
                  / {Math.round(macros.calories.target)}
                </span>
              </>
            ) : (
              Math.round(macros.calories.target)
            )}
          </span>
          <span className="text-zinc-400 text-sm font-medium">
            Calorías requeridas
          </span>
        </div>

        <div className="z-10">
          <MacroRing
            value={macros.calories.current}
            target={macros.calories.target}
            size="lg"
            color="white"
            icon={<img src="/flame.svg" alt="Calories" className="w-8 h-8 brightness-0 invert -translate-y-1" />}
          />
        </div>
      </SummaryCard>

      {/* Macros Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Protein */}
        <SummaryCard
          onClick={toggleDetails}
          delay={0.1}
          className="flex flex-col items-center justify-center p-4 space-y-3"
        >
          <div className="text-center flex flex-col items-center">
            <div className="flex items-baseline justify-center">
              <span className="block text-xl font-bold text-white leading-none">
                {getGridDisplayValue(macros.protein.current, macros.protein.target)}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Proteínas
            </span>
          </div>

          <MacroRing
            value={macros.protein.current}
            target={macros.protein.target}
            size="md"
            color="protein"
            icon={<FlatIcon name="sr-drumstick" style={{ color: '#dd6969' }} size={20} />}
          />
        </SummaryCard>

        {/* Carbs */}
        <SummaryCard
          onClick={toggleDetails}
          delay={0.2}
          className="flex flex-col items-center justify-center p-4 space-y-3"
        >
          <div className="text-center flex flex-col items-center">
            <div className="flex items-baseline justify-center">
              <span className="block text-xl font-bold text-white leading-none">
                {getGridDisplayValue(macros.carbs.current, macros.carbs.target)}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Carbohid.
            </span>
          </div>

          <MacroRing
            value={macros.carbs.current}
            target={macros.carbs.target}
            size="md"
            color="carbs"
            icon={<FlatIcon name="sr-wheat" style={{ color: '#EB9F6D' }} size={20} />}
          />
        </SummaryCard>

        {/* Fats */}
        <SummaryCard
          onClick={toggleDetails}
          delay={0.3}
          className="flex flex-col items-center justify-center p-4 space-y-3"
        >
          <div className="text-center flex flex-col items-center">
            <div className="flex items-baseline justify-center">
              <span className="block text-xl font-bold text-white leading-none">
                {getGridDisplayValue(macros.fats.current, macros.fats.target)}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              Grasas
            </span>
          </div>

          <MacroRing
            value={macros.fats.current}
            target={macros.fats.target}
            size="md"
            color="fat"
            icon={<FlatIcon name="sr-avocado" style={{ color: '#6C95DC' }} size={20} />}
          />
        </SummaryCard>
      </div>
    </div>
  );
});

