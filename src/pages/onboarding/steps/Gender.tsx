import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import SelectableCard from "@/components/onboarding/SelectableCard";
import { OnboardingContext } from "../OnboardingFlow";

const Gender: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  // Add error logging to debug the issue
  console.log("OnboardingContext in Gender:", context);

  if (!context) {
    console.error("OnboardingContext is null in Gender component");
    throw new Error("Gender must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const handleSelect = (gender: "male" | "female" | "other") => {
    updateData({ gender });
  };

  const handleNext = () => {
    navigate("/onboarding/training-frequency");
  };

  return (
    <OnboardingLayout currentStep={2} totalSteps={20}>
      <h1 className="h1 mb-8">¿Cómo te identificas?</h1>

      <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto w-full">
        <SelectableCard
          selected={data.gender === "male"}
          onSelect={() => handleSelect("male")}
          icon={<img src="/cabeza-de-hombre-2.svg" alt="Masculino" className="w-7 h-7 brightness-0 invert" />}
          label="Masculino"
        />

        <SelectableCard
          selected={data.gender === "female"}
          onSelect={() => handleSelect("female")}
          icon={<img src="/cabeza-de-mujer.svg" alt="Femenino" className="w-7 h-7 brightness-0 invert" />}
          label="Femenino"
        />

        <SelectableCard
          selected={data.gender === "other"}
          onSelect={() => handleSelect("other")}
          icon={<img src="/venus-marte.svg" alt="Otro" className="w-7 h-7 brightness-0 invert" />}
          label="Otro/Prefiero no decirlo"
        />
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={!data.gender}
      />
    </OnboardingLayout>
  );
};

export default Gender;
