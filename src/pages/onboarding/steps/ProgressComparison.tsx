
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const ProgressComparison: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("ProgressComparison must be used within OnboardingContext");
  }

  const handleNext = () => {
    navigate("/onboarding/physical-data");
  };

  // SVG Configuration
  const width = 300;
  const height = 180;
  // Start point (Left, slightly up from center)
  const startX = 20;
  const startY = 60;

  // Traditional Diet Path (The "Yoyo" effect)
  // Starts at startY, dips down a bit (to 90), then shoots UP way high (to 20)
  const traditionalPath = `M ${startX} ${startY} C 100 ${startY + 20}, 120 ${startY + 40}, 160 80 S 240 20, 280 20`;

  // Gatofit AI Path (The "Sustainable" drop)
  // Starts at startY, gradual curve down to bottom
  const aiPath = `M ${startX} ${startY} C 100 ${startY}, 150 ${startY + 20}, 180 100 S 240 140, 280 150`;

  return (
    <OnboardingLayout currentStep={5} totalSteps={20} className="flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 px-2"
        >
          <h1 className="text-3xl font-bold leading-tight">
            Gatofit crea resultados a largo plazo
          </h1>
        </motion.div>

        {/* Chart Card */}
        <motion.div
          className="bg-secondary/20 border border-white/5 rounded-3xl p-6 relative overflow-visible shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-4">
            <h3 className="text-lg font-medium text-foreground/80">Tu peso</h3>
          </div>

          <div className="relative h-[220px] w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Grid Lines (Dotted) */}
              <line x1="0" y1={startY} x2={width} y2={startY} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />
              <line x1="0" y1={height - 40} x2={width} y2={height - 40} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />

              {/* Traditional Line (Red) - Rebound */}
              <motion.path
                d={traditionalPath}
                fill="none"
                stroke="#ef4444" // red-500
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
              />

              {/* Gatofit Line (White/Primary) - Success */}
              <motion.path
                d={aiPath}
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
              />

              {/* End Points */}
              <motion.circle
                cx="20" cy="60" r="4" fill="white" stroke="black" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              />
              <motion.circle
                cx="280" cy="150" r="4" fill="white" stroke="black" strokeWidth="2"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.9 }}
              />
            </svg>

            {/* Labels overlayed absolutely for easier positioning */}

            {/* Traditional Label */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute top-[10%] right-[5%] flex items-center gap-2"
            >
              <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-md border border-red-400/20">
                Dieta tradicional
              </span>
            </motion.div>

            {/* Gatofit Label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.5 }}
              className="absolute bottom-[25%] left-[40%] transform -translate-x-1/2"
            >
              <div className="flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 rounded-full shadow-xl">
                <img src="/logo negro.svg" alt="Gatofit" className="w-3.5 h-3.5" />
                <span className="text-xs font-bold whitespace-nowrap">Gatofit</span>
              </div>
            </motion.div>

            {/* X Axis */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-2 border-t border-white/5 pt-2">
              <span>Mes 1</span>
              <span>Mes 6</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              El 80% de los usuarios de Gatofit mantienen su pérdida de peso incluso 6 meses después.
            </p>
          </div>
        </motion.div>

        <div className="mt-auto pt-8">
          <OnboardingNavigation onNext={handleNext} />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ProgressComparison;
