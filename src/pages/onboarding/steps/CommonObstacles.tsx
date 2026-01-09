
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface Obstacle {
  id: number;
  name: string;
  description: string | null;
}

// Static obstacles for the demo
const OBSTACLES = [
  { id: 1, name: "Falta de tiempo", description: "Dificultad para encontrar tiempo para actividades fitness" },
  { id: 2, name: "Falta de motivación", description: "Problemas con la motivación constante" },
  { id: 3, name: "No saber qué comer", description: "Incertidumbre sobre elecciones nutricionales" },
  { id: 4, name: "No saber cómo entrenar", description: "Falta de conocimiento sobre entrenamiento efectivo" },
  { id: 5, name: "Lesiones anteriores", description: "Limitaciones físicas por lesiones pasadas" },
  { id: 6, name: "Otro", description: "Otros obstáculos no listados" }
];

const CommonObstacles: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("CommonObstacles must be used within OnboardingContext");
  }

  const { data, updateData } = context;

  const toggleObstacle = (obstacleId: string) => {
    const currentObstacles = [...data.obstacles];
    const index = currentObstacles.indexOf(obstacleId);

    if (index === -1) {
      currentObstacles.push(obstacleId);
    } else {
      currentObstacles.splice(index, 1);
    }

    updateData({ obstacles: currentObstacles });
  };

  const handleNext = () => {
    navigate("/onboarding/diet");
  };

  return (
    <OnboardingLayout currentStep={12} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-4">
        ¿Qué suele detenerte para alcanzar tus metas?
      </h1>

      <p className="text-muted-foreground mb-8">
        Selecciona todos los que apliquen
      </p>

      <div className="space-y-3 w-full max-w-md mx-auto">
        {OBSTACLES.map((obstacle) => (
          <div
            key={obstacle.id}
            className="flex items-center space-x-3 rounded-lg p-3 bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-colors cursor-pointer"
            onClick={() => toggleObstacle(obstacle.id.toString())}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${data.obstacles.includes(obstacle.id.toString()) ? 'bg-primary' : 'bg-secondary/50 border border-muted'}`}>
              {data.obstacles.includes(obstacle.id.toString()) && (
                <Check className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{obstacle.name}</div>
              <div className="text-xs text-muted-foreground">{obstacle.description}</div>
            </div>
          </div>
        ))}
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextDisabled={data.obstacles.length === 0}
      />
    </OnboardingLayout>
  );
};

export default CommonObstacles;
