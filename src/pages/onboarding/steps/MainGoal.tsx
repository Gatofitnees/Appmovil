
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import SelectableCard from "@/components/onboarding/SelectableCard";
import { OnboardingContext } from "../OnboardingFlow";

const MainGoal: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("MainGoal must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const handleSelect = (goal: "gain_muscle" | "lose_weight" | "maintain_weight") => {
    // If the goal changes, reset the target weight so the next screen calculates a new smart default
    if (data.mainGoal !== goal) {
      updateData({ mainGoal: goal, targetWeight: undefined });
    } else {
      updateData({ mainGoal: goal });
    }
  };

  const handleNext = () => {
    navigate("/onboarding/target-weight");
  };

  return (
    <OnboardingLayout currentStep={8} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿Cuál es tu principal objetivo de fitness?</h1>

      <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto w-full">
        <SelectableCard
          selected={data.mainGoal === "gain_muscle"}
          onSelect={() => handleSelect("gain_muscle")}
          icon={<img src="/gimnasio.svg" alt="Ganar Músculo" className="w-7 h-7 brightness-0 invert" />}
          label="Ganar Masa Muscular"
        >
          <p className="text-xs text-muted-foreground text-center mt-1">
            Aumentar fuerza y volumen muscular
          </p>
        </SelectableCard>

        <SelectableCard
          selected={data.mainGoal === "lose_weight"}
          onSelect={() => handleSelect("lose_weight")}
          icon={<img src="/perdida-de-peso-2.svg" alt="Perder Peso" className="w-7 h-7 brightness-0 invert" />}
          label="Perder Peso / Grasa"
        >
          <p className="text-xs text-muted-foreground text-center mt-1">
            Reducir peso y porcentaje de grasa
          </p>
        </SelectableCard>

        <SelectableCard
          selected={data.mainGoal === "maintain_weight"}
          onSelect={() => handleSelect("maintain_weight")}
          icon={<img src="/levantamiento-de-pesas-con-mancuernas-2.svg" alt="Mantener" className="w-7 h-7 brightness-0 invert" />}
          label="Mantenerme en Forma"
        >
          <p className="text-xs text-muted-foreground text-center mt-1">
            Mantener peso y mejorar salud general
          </p>
        </SelectableCard>
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={!data.mainGoal}
      />
    </OnboardingLayout>
  );
};

export default MainGoal;
