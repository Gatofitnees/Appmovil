
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import { Snail, Rabbit, Zap } from "lucide-react";

const DesiredPace: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  const [sliderValue, setSliderValue] = useState(2);
  const [feedbackText, setFeedbackText] = useState("");

  if (!context) {
    throw new Error("DesiredPace must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  // Update pace based on slider value
  useEffect(() => {
    let pace: "sloth" | "rabbit" | "leopard" | null = null;
    let kgPerWeek = 0;

    if (sliderValue === 1) {
      pace = "sloth";
      kgPerWeek = 0.25;
    } else if (sliderValue === 2) {
      pace = "rabbit";
      kgPerWeek = 0.5;
    } else if (sliderValue === 3) {
      pace = "rabbit";
      kgPerWeek = 0.65;
    } else if (sliderValue === 4) {
      pace = "leopard";
      kgPerWeek = 0.75;
    } else if (sliderValue === 5) {
      pace = "leopard";
      kgPerWeek = 0.9;
    }

    updateData({
      targetPace: pace,
      targetKgPerWeek: kgPerWeek
    });
  }, [sliderValue]);

  // Update feedback text based on selected pace and goal
  useEffect(() => {
    if (!data.targetKgPerWeek || !data.mainGoal) return;

    const isWeightLoss = data.mainGoal === "lose_weight";
    const verb = isWeightLoss ? "perderás" : "ganarás";

    setFeedbackText(`Con este ritmo, ${verb} aproximadamente ${data.targetKgPerWeek} kg por semana.`);
  }, [data.targetKgPerWeek, data.mainGoal]);

  const handleNext = () => {
    navigate("/onboarding/common-obstacles");
  };

  // Get icon and text based on slider value
  const getIconInfo = (value: number) => {
    if (value <= 2) {
      return {
        icon: <Snail className="h-6 w-6 text-primary" />,
        title: "Constante",
        description: "~0.25-0.5 kg/semana"
      };
    } else if (value <= 3) {
      return {
        icon: <Rabbit className="h-6 w-6 text-primary" />,
        title: "Equilibrado",
        description: "~0.5-0.65 kg/semana"
      };
    } else {
      return {
        icon: <Zap className="h-6 w-6 text-primary" />,
        title: "Intenso",
        description: "~0.75-0.9 kg/semana"
      };
    }
  };

  const iconInfo = getIconInfo(sliderValue);

  return (
    <OnboardingLayout currentStep={11} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">¿A qué ritmo quieres alcanzar tu meta?</h1>

      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="bg-secondary/20 border border-white/5 p-5 rounded-xl relative space-y-6 shadow-sm backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="text-center flex flex-col items-center">
              <Snail className="h-6 w-6 mb-2" />
              <p className="text-sm">Constante</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <Rabbit className="h-6 w-6 mb-2" />
              <p className="text-sm">Equilibrado</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <Zap className="h-6 w-6 mb-2" />
              <p className="text-sm">Intenso</p>
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0.25 kg/semana</span>
            <span>0.9 kg/semana</span>
          </div>
        </div>

        {/* Selected pace information */}
        <div className="bg-secondary/10 p-5 rounded-xl text-center space-y-3">
          <div className="flex justify-center">
            {iconInfo.icon}
          </div>
          <h3 className="font-medium text-lg">{iconInfo.title}</h3>
          <p className="text-sm text-muted-foreground">{iconInfo.description}</p>
        </div>

        {/* Dynamic feedback about selected pace */}
        {feedbackText && (
          <motion.div
            className="text-center p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={feedbackText}
          >
            <p className="text-sm">
              <span className="text-muted-foreground">Estimación: </span>
              <span className="text-primary font-medium">{feedbackText}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {sliderValue <= 2 && "Este es un ritmo sostenible ideal para cambios graduales y a largo plazo."}
              {sliderValue === 3 && "Este es un buen equilibrio entre resultados y sostenibilidad."}
              {sliderValue >= 4 && "Este ritmo es más exigente y requiere mayor disciplina y constancia."}
            </p>
          </motion.div>
        )}
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={!data.targetPace}
      />
    </OnboardingLayout>
  );
};

export default DesiredPace;
