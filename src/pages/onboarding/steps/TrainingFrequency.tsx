
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import NeuSlider from "@/components/onboarding/NeuSlider";
import { OnboardingContext } from "../OnboardingFlow";

const TrainingFrequency: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("TrainingFrequency must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const handleChange = (value: number[]) => {
    updateData({ trainingsPerWeek: value[0] });
  };

  const handleNext = () => {
    navigate("/onboarding/previous-experience");
  };

  return (
    <OnboardingLayout currentStep={3} totalSteps={20}>
      <h1 className="h1 mb-8">
        ¿Cuántos días a la semana sueles entrenar?
      </h1>

      <div className="w-full max-w-md mx-auto">
        <NeuSlider
          min={0}
          max={7}
          step={1}
          value={[data.trainingsPerWeek]}
          onValueChange={handleChange}
          className="my-12"
        />

        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>0 días</span>
          <span>7 días</span>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full bg-secondary/20 border border-white/5 rounded-xl p-6 text-center mt-8 shadow-sm backdrop-blur-sm"
        >
          <span className="text-6xl font-bold text-primary mb-2 block tracking-tight">
            {data.trainingsPerWeek}
          </span>
          <span className="text-base text-muted-foreground font-medium">
            {data.trainingsPerWeek === 1
              ? "día a la semana"
              : "días a la semana"}
          </span>
        </motion.div>
      </div>

      <OnboardingNavigation onNext={handleNext} />
    </OnboardingLayout>
  );
};

export default TrainingFrequency;
