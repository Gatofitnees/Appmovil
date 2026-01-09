
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import LoadingCalculation from "@/components/onboarding/LoadingCalculation";
import MacroRecommendationDisplay from "@/components/onboarding/MacroRecommendationDisplay";
import { OnboardingContext } from "../OnboardingFlow";
import { calculateOptimizedRecommendation } from "@/utils/macroCalculations";

const InitialRecommendation: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("InitialRecommendation must be used within OnboardingContext");
  }

  const { data, updateData } = context;
  // Initialize loading based on whether we already have the data
  const [isCalculating, setIsCalculating] = useState(!data.initial_recommended_calories);
  const [calculationError, setCalculationError] = useState(false);

  // Enhanced macro calculation with improved formula
  useEffect(() => {
    // Only calculate if we don't have data yet
    if (data.initial_recommended_calories) {
      setIsCalculating(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const calculatedRecommendation = calculateOptimizedRecommendation(data);

        updateData({
          initial_recommended_calories: calculatedRecommendation.calories,
          initial_recommended_protein_g: calculatedRecommendation.protein,
          initial_recommended_carbs_g: calculatedRecommendation.carbs,
          initial_recommended_fats_g: calculatedRecommendation.fats
        });

        setIsCalculating(false);
      } catch (error) {
        console.error('Error calculating recommendations:', error);
        setCalculationError(true);

        // Fallback to basic calculations
        const fallbackRecommendation = {
          calories: 2000,
          protein: 120,
          carbs: 200,
          fats: 65
        };

        updateData({
          initial_recommended_calories: fallbackRecommendation.calories,
          initial_recommended_protein_g: fallbackRecommendation.protein,
          initial_recommended_carbs_g: fallbackRecommendation.carbs,
          initial_recommended_fats_g: fallbackRecommendation.fats
        });

        setIsCalculating(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    navigate("/onboarding/features-preview");
  };

  return (
    <OnboardingLayout currentStep={16} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-8">Tu Punto de Partida Personalizado</h1>

      <div className="w-full max-w-md mx-auto">
        {isCalculating ? (
          <LoadingCalculation calculationError={calculationError} />
        ) : (
          <MacroRecommendationDisplay
            calories={data.initial_recommended_calories || 2000}
            protein={data.initial_recommended_protein_g || 120}
            carbs={data.initial_recommended_carbs_g || 200}
            fats={data.initial_recommended_fats_g || 65}
            trainingsPerWeek={data.trainingsPerWeek || 3}
            onUpdate={(values) => updateData({
              initial_recommended_calories: values.calories,
              initial_recommended_protein_g: values.protein,
              initial_recommended_carbs_g: values.carbs,
              initial_recommended_fats_g: values.fats
            })}
          />
        )}
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={isCalculating}
      />
    </OnboardingLayout>
  );
};

export default InitialRecommendation;
