
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Dumbbell, Timer, HeartPulse, Moon, Calendar } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

interface Achievement {
  id: number;
  name: string;
  icon: React.ReactNode;
}

// Static achievements for the demo
const ACHIEVEMENTS: Achievement[] = [
  { id: 1, name: "Sentirme con más energía", icon: <Zap className="h-5 w-5" /> },
  { id: 2, name: "Mejorar mi fuerza", icon: <Dumbbell className="h-5 w-5" /> },
  { id: 3, name: "Aumentar mi resistencia", icon: <Timer className="h-5 w-5" /> },
  { id: 4, name: "Reducir el estrés", icon: <HeartPulse className="h-5 w-5" /> },
  { id: 5, name: "Dormir mejor", icon: <Moon className="h-5 w-5" /> },
  { id: 6, name: "Construir hábitos saludables", icon: <Calendar className="h-5 w-5" /> }
];

const DesiredAchievements: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("DesiredAchievements must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  // Ensure achievements is always an array
  const currentAchievements = data.achievements || [];

  const toggleAchievement = (achievementId: string) => {
    const updatedAchievements = [...currentAchievements];
    const index = updatedAchievements.indexOf(achievementId);

    if (index === -1) {
      updatedAchievements.push(achievementId);
    } else {
      updatedAchievements.splice(index, 1);
    }

    updateData({ achievements: updatedAchievements });
  };

  const handleNext = () => {
    navigate("/onboarding/gratitude");
  };

  return (
    <OnboardingLayout currentStep={14} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-4">
        Más allá de los números, ¿qué te gustaría lograr?
      </h1>

      <p className="text-muted-foreground mb-8">
        Selecciona todos los que apliquen
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mx-auto">
        {ACHIEVEMENTS.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-center space-x-3 rounded-lg p-4 transition-all cursor-pointer border ${currentAchievements.includes(achievement.id.toString())
              ? "bg-primary/10 border-primary"
              : "bg-secondary/20 border-white/5 hover:bg-secondary/30"
              }`}
            onClick={() => toggleAchievement(achievement.id.toString())}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentAchievements.includes(achievement.id.toString())
              ? "bg-primary text-white"
              : "bg-secondary/30 text-muted-foreground"
              }`}>
              {achievement.icon}
            </div>
            <div className="flex-1 font-medium">
              {achievement.name}
            </div>
            {currentAchievements.includes(achievement.id.toString()) && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
        ))}
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={currentAchievements.length === 0}
      />
    </OnboardingLayout>
  );
};

export default DesiredAchievements;
