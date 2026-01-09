
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import SelectableCard from "@/components/onboarding/SelectableCard";
import { OnboardingContext } from "../OnboardingFlow";

const PreviousExperience: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("PreviousExperience must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const handleSelect = (value: boolean) => {
    updateData({ previousAppExperience: value });
  };

  const handleNext = () => {
    navigate("/onboarding/progress-comparison");
  };

  return (
    <OnboardingLayout currentStep={4} totalSteps={20}>
      <h1 className="h1 mb-8">
        ¿Has usado antes apps de entrenamiento o seguimiento de macros?
      </h1>

      <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto w-full">
        <SelectableCard
          selected={data.previousAppExperience === true}
          onSelect={() => handleSelect(true)}
          icon={<CheckCircle2 size={32} />}
          label="Sí, tengo experiencia"
        >
          <p className="small text-muted-foreground text-center mt-1">
            He usado otras apps de fitness regularmente
          </p>
        </SelectableCard>

        <SelectableCard
          selected={data.previousAppExperience === false}
          onSelect={() => handleSelect(false)}
          icon={<XCircle size={32} />}
          label="No, soy nuevo/a en esto"
        >
          <p className="small text-muted-foreground text-center mt-1">
            Es mi primera vez usando una app de fitness
          </p>
        </SelectableCard>
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={data.previousAppExperience === null}
      />
    </OnboardingLayout>
  );
};

export default PreviousExperience;
