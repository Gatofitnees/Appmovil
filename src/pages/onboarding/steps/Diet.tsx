
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const Diet: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("Diet must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const handleSelect = (dietId: number) => {
    updateData({ diet: dietId });
  };

  const handleNext = () => {
    navigate("/onboarding/desired-achievements");
  };

  // Diet options (matching the diet_types table in Supabase)
  const dietOptions = [
    { id: 1, name: "Clásica", icon: <img src="/pavo.svg" alt="Clásica" className="w-8 h-8 brightness-0 invert" /> },
    { id: 2, name: "Vegetariana", icon: <img src="/queso.svg" alt="Vegetariana" className="w-8 h-8 brightness-0 invert" /> },
    { id: 3, name: "Vegana", icon: <img src="/lechuga.svg" alt="Vegana" className="w-8 h-8 brightness-0 invert" /> },
    { id: 4, name: "Pescetariana", icon: <img src="/pez.svg" alt="Pescetariana" className="w-8 h-8 brightness-0 invert" /> },
  ];

  return (
    <OnboardingLayout currentStep={13} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Sigues alguna dieta específica?</h1>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm mx-auto">
        {dietOptions.map((diet) => {
          const isSelected = data.diet === diet.id;
          return (
            <motion.div
              key={diet.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(diet.id)}
              className={`
                w-full p-4 rounded-xl cursor-pointer transition-all duration-200 border flex items-center
                ${isSelected
                  ? "bg-primary/10 border-primary"
                  : "bg-secondary/20 border-white/5 hover:bg-secondary/30"}
              `}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 transition-colors
                ${isSelected ? "bg-primary text-white" : "bg-secondary/30 text-muted-foreground"}
              `}>
                {diet.icon}
              </div>
              <span className="text-lg font-medium">{diet.name}</span>
            </motion.div>
          );
        })}
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={!data.diet}
      />
    </OnboardingLayout>
  );
};

export default Diet;
