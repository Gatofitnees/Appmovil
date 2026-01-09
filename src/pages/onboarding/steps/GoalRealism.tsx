
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const GoalRealism: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("GoalRealism must be used within OnboardingContext");
  }

  const { data } = context;

  const handleNext = () => {
    navigate("/onboarding/desired-pace");
  };

  // Evaluate goal difficulty
  const weightDiff = data.targetWeight && data.weight
    ? Math.abs(data.targetWeight - data.weight)
    : 0;

  const getDifficulty = () => {
    if (data.mainGoal === "maintain_weight") return "easy";
    if (weightDiff <= 3) return "easy";
    if (weightDiff <= 8) return "moderate";
    return "hard";
  };

  const difficulty = getDifficulty();

  const getContent = () => {
    const action = data.targetWeight && data.weight && data.targetWeight > data.weight ? "Ganar" : "Perder";
    const diffText = `${weightDiff.toFixed(1)} ${data.weightUnit || 'kg'}`;

    if (difficulty === "hard") {
      return {
        title: "¡Wow! Es un gran desafío",
        description: "Uy está duro, pero sé que con constancia y el plan adecuado lo vamos a conseguir."
      };
    } else if (difficulty === "moderate") {
      return {
        title: `¡Genial! ${action} ${diffText} es realista`,
        description: "Es un reto estimulante, pero con nuestra ayuda lo lograrás sin problemas."
      };
    } else {
      return {
        title: "¡Objetivo muy alcanzable!",
        description: data.mainGoal === "maintain_weight"
          ? "Mantenerte en forma es una excelente decisión para tu salud."
          : `Es un paso seguro. ${action} ${diffText} será pan comido para ti.`
      };
    }
  };

  const content = getContent();

  return (
    <OnboardingLayout currentStep={10} totalSteps={20} className="justify-center items-center text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.6
        }}
        className="mb-8 w-full flex justify-center"
      >
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Pulse effect for emphasis */}
          <div className={`absolute inset-0 rounded-full ${difficulty === 'hard' ? 'animate-pulse-ring bg-primary/20' : 'bg-transparent'}`} />

          {/* Particle Effects */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180);
              const radius = 80 + Math.random() * 40;
              return (
                <motion.div
                  key={i}
                  className={`absolute w-1.5 h-1.5 rounded-full ${difficulty === 'hard' ? 'bg-primary' : 'bg-sky-400'}`}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut",
                    delay: 0.2 + Math.random() * 0.1
                  }}
                />
              );
            })}
          </div>

          <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 
            ${difficulty === 'hard' ? 'bg-primary shadow-[0_0_30px_rgba(59,130,246,0.6)]' : 'bg-primary/10'}`}>
            <Check strokeWidth={4} className={`h-16 w-16 ${difficulty === 'hard' ? 'text-white' : 'text-primary'}`} />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-6 px-4">
          {content.title}
        </h1>

        <p className="text-lg text-muted-foreground mb-12 max-w-xs mx-auto leading-relaxed">
          {content.description}
        </p>
      </motion.div>

      <OnboardingNavigation onNext={handleNext} className="w-full max-w-md" />
    </OnboardingLayout>
  );
};

export default GoalRealism;
