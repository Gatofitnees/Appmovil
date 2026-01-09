
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";

const Gratitude: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/onboarding/initial-recommendation");
  };

  // Particle animation for celebration
  const particles = Array.from({ length: 20 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 rounded-full bg-primary"
      initial={{
        scale: 0,
        opacity: 1,
        x: 0,
        y: 0
      }}
      animate={{
        scale: Math.random() * 1.5 + 0.5,
        opacity: 0,
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100
      }}
      transition={{
        duration: 1.5,
        delay: Math.random() * 0.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 0.5 + 1,
      }}
      style={{
        top: `${50 + (Math.random() - 0.5) * 20}%`,
        left: `${50 + (Math.random() - 0.5) * 20}%`,
      }}
    />
  ));

  return (
    <OnboardingLayout currentStep={15} totalSteps={20}>
      <div className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[calc(100vh-200px)]">
        {particles}

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8 relative"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-12 w-12 text-primary" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-2xl font-bold mb-4"
        >
          ¡Gracias por compartir tus metas con Gatofit!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-muted-foreground max-w-sm mx-auto"
        >
          Estamos emocionados de acompañarte en este viaje hacia una versión más saludable de ti.
        </motion.p>
      </div>

      <OnboardingNavigation onNext={handleNext} />
    </OnboardingLayout>
  );
};

export default Gratitude;
