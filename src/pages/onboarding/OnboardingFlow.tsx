import React, { createContext, useState, useCallback } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import OnboardingErrorBoundary from "@/components/onboarding/OnboardingErrorBoundary";
import Welcome from "./steps/Welcome";
import Gender from "./steps/Gender";
import BirthDate from "./steps/BirthDate";
import MainGoal from "./steps/MainGoal";
import TargetWeight from "./steps/TargetWeight";
import ProgressComparison from "./steps/ProgressComparison";
import PhysicalData from "./steps/PhysicalData";
import PreviousExperience from "./steps/PreviousExperience";
import TrainingFrequency from "./steps/TrainingFrequency";
import Diet from "./steps/Diet";
import GoalRealism from "./steps/GoalRealism";
import DesiredPace from "./steps/DesiredPace";
import CommonObstacles from "./steps/CommonObstacles";
import DesiredAchievements from "./steps/DesiredAchievements";
import Gratitude from './steps/Gratitude';
import PromoCode from './steps/PromoCode';
import InitialRecommendation from './steps/InitialRecommendation';
import FeaturesPreview from "./steps/FeaturesPreview";
import CreateAccount from "./steps/CreateAccount";
import Login from "./steps/Login";
import AppTransition from "./steps/AppTransition";

// Define the structure of the onboarding data
export interface OnboardingData {
  gender?: "male" | "female" | "other";
  birthDate?: string;
  dateOfBirth?: Date | string;
  mainGoal?: "lose_weight" | "gain_muscle" | "maintain_weight" | "improve_health";
  targetWeight?: number;
  height?: number;
  heightUnit?: "cm" | "ft-in";
  weight?: number;
  weightUnit?: "kg" | "lbs";
  bodyFatPercentage?: number;
  unit_system_preference?: "metric" | "imperial";
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  trainingFrequency?: number;
  trainingsPerWeek?: number;
  previousAppExperience?: boolean;
  dietPreference?: "omnivore" | "vegetarian" | "vegan" | "keto" | "paleo" | "mediterranean";
  diet?: number;
  desiredPace?: "slow" | "moderate" | "fast";
  targetPace?: "sloth" | "rabbit" | "leopard";
  targetKgPerWeek?: number;
  commonObstacles?: string[];
  obstacles?: string[];
  desiredAchievements?: string[];
  achievements?: string[];
  promoCode?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  initial_recommended_calories?: number;
  initial_recommended_protein_g?: number;
  initial_recommended_carbs_g?: number;
  initial_recommended_fats_g?: number;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
}

export const OnboardingContext = createContext<OnboardingContextType | null>(null);

const OnboardingFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<OnboardingData>({
    achievements: [],
    obstacles: [],
    trainingsPerWeek: 3, // Default value set to 3 days
    weightUnit: "kg", // Default to metric system
    heightUnit: "cm",
    unit_system_preference: "metric"
  });

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const contextValue = {
    data,
    updateData
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.99
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1, // Stagger children by 0.1s
        delayChildren: 0.1 // Tiny delay before starting
      }
    },
    out: {
      opacity: 0,
      scale: 0.99,
      transition: { duration: 0.2 }
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "easeOut",
    duration: 0.4
  };

  // Step mapping configuration
  // Based on actual navigation flow:
  // Welcome -> Gender -> TrainingFrequency -> PreviousExperience -> ProgressComparison -> PhysicalData -> BirthData -> MainGoal -> TargetWeight -> GoalRealism -> DesiredPace -> CommonObstacles -> Diet -> DesiredAchievements -> Gratitude -> InitialRecommendation -> FeaturesPreview -> CreateAccount
  const stepConfig: Record<string, number> = {
    "/onboarding/welcome": 1,
    "/onboarding/gender": 2,
    "/onboarding/training-frequency": 3,
    "/onboarding/previous-experience": 4,
    "/onboarding/progress-comparison": 5,
    "/onboarding/physical-data": 6,
    "/onboarding/birth-date": 7,
    "/onboarding/main-goal": 8,
    "/onboarding/target-weight": 9,
    "/onboarding/goal-realism": 10,
    "/onboarding/desired-pace": 11,
    "/onboarding/common-obstacles": 12,
    "/onboarding/diet": 13,
    "/onboarding/desired-achievements": 14,
    "/onboarding/gratitude": 15,
    "/onboarding/promo-code": 16,
    "/onboarding/initial-recommendation": 17,
    "/onboarding/features-preview": 18,
    "/onboarding/create-account": 19,
    "/onboarding/login": 20,
    "/onboarding/app-transition": 21,
  };

  const currentPath = location.pathname;
  // Default to 1 if not found, or handle specifically
  const currentStep = stepConfig[currentPath] || 1;
  const totalSteps = 21;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Routes where we should NOT show the progress bar (like the final transition or welcome maybe?)
  // For now, let's show it everywhere inside the flow except maybe app-transition if desired.
  const showProgress = !["/onboarding/app-transition", "/onboarding/welcome"].includes(currentPath);

  return (
    <OnboardingErrorBoundary>
      <OnboardingContext.Provider value={contextValue}>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          {showProgress && (
            <div
              className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md"
              style={{ paddingTop: 'calc(var(--safe-area-inset-top) + 2rem)' }}
            >
              <div className="w-full px-4 pt-4 pb-2">
                <div className="max-w-md mx-auto flex items-center gap-3">
                  {currentStep > 1 && (
                    <button
                      onClick={() => navigate(-1)}
                      className="p-2 -ml-2 rounded-full hover:bg-secondary/20 transition-colors text-foreground"
                      aria-label="Atrás"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <Progress value={progressPercentage} className="h-1 flex-1" />
                </div>
              </div>
            </div>
          )}

          <main
            className="flex-1 w-full flex flex-col"
            style={{
              paddingTop: showProgress
                ? 'calc(var(--safe-area-inset-top) + 3.5rem)'
                // If no progress bar, we still might want safe area padding depending on the screen
                : 'var(--safe-area-inset-top)'
            }}
          >
            <div className="w-full flex-1 max-w-md mx-auto h-full px-4 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="w-full flex-1 flex flex-col"
                >
                  <Routes location={location}>
                    <Route path="welcome" element={<Welcome />} />
                    <Route path="gender" element={<Gender />} />
                    <Route path="birth-date" element={<BirthDate />} />
                    <Route path="main-goal" element={<MainGoal />} />
                    <Route path="target-weight" element={<TargetWeight />} />
                    <Route path="progress-comparison" element={<ProgressComparison />} />
                    <Route path="physical-data" element={<PhysicalData />} />
                    <Route path="previous-experience" element={<PreviousExperience />} />
                    <Route path="training-frequency" element={<TrainingFrequency />} />
                    <Route path="diet" element={<Diet />} />
                    <Route path="goal-realism" element={<GoalRealism />} />
                    <Route path="desired-pace" element={<DesiredPace />} />
                    <Route path="common-obstacles" element={<CommonObstacles />} />
                    <Route path="desired-achievements" element={<DesiredAchievements />} />
                    <Route path="gratitude" element={<Gratitude />} />
                    <Route path="promo-code" element={<PromoCode />} />
                    <Route path="initial-recommendation" element={<InitialRecommendation />} />
                    <Route path="features-preview" element={<FeaturesPreview />} />
                    <Route path="create-account" element={<CreateAccount />} />
                    <Route path="login" element={<Login />} />
                    <Route path="app-transition" element={<AppTransition />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </OnboardingContext.Provider>
    </OnboardingErrorBoundary>
  );
};

export default OnboardingFlow;
