
import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import MacroRing from "./MacroRing";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";
import { FlatIcon } from "./ui/FlatIcon";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useBranding } from "@/contexts/BrandingContext";

interface MacroData {
  calories: { current: number; target: number; unit: string };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
}

interface MacrosCardProps {
  macros?: MacroData;
  className?: string;
  onAddFood?: () => void;
}

const MacrosCard: React.FC<MacrosCardProps> = ({
  macros: propMacros,
  className,
  onAddFood
}) => {
  const { profile, recalculatingMacros } = useProfileContext();
  const { branding } = useBranding();

  // Use provided macros or create default ones from profile
  const macros = propMacros || {
    calories: {
      current: 0,
      target: profile?.initial_recommended_calories || 2000,
      unit: "kcal"
    },
    protein: {
      current: 0,
      target: profile?.initial_recommended_protein_g || 120
    },
    carbs: {
      current: 0,
      target: profile?.initial_recommended_carbs_g || 200
    },
    fats: {
      current: 0,
      target: profile?.initial_recommended_fats_g || 65
    }
  };

  return (
    <Card className={cn("animate-fade-in", className)}>
      <CardHeader
        title="Mis Macros Hoy"
        subtitle="Resumen de objetivos nutricionales"
      />
      <CardBody>
        <div className="flex flex-col space-y-6">
          {/* Loading indicator for macro recalculation */}
          {recalculatingMacros && (
            <div
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-xl",
                !branding.hasCoach && "bg-primary/10"
              )}
              style={branding.hasCoach ? {
                backgroundColor: `${branding.primaryButtonColor}10`
              } : {}}
            >
              <Loader2
                className={cn(
                  "h-4 w-4 animate-spin",
                  !branding.hasCoach && "text-primary"
                )}
                style={branding.hasCoach ? { color: branding.primaryButtonColor } : {}}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  !branding.hasCoach && "text-primary"
                )}
                style={branding.hasCoach ? { color: branding.primaryButtonColor } : {}}
              >
                Recalculando macros...
              </span>
            </div>
          )}

          {/* Main calorie counter */}
          <div className="bg-background/40 p-4 rounded-xl shadow-inner-dark">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{macros.calories.target}</div>
                <div className="text-xs text-muted-foreground">Calorías requeridas</div>
              </div>
              <div className="flex-shrink-0">
                <MacroRing
                  value={macros.calories.current}
                  target={macros.calories.target}
                  color="white"
                  size="md"
                  icon={<img src="/flame.svg" alt="Calories" className="w-6 h-6 brightness-0 invert -translate-y-1" />}
                />
              </div>
            </div>
          </div>

          {/* Macros grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Protein */}
            <div className="bg-background/40 p-3 rounded-xl shadow-inner-dark">
              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold">{macros.protein.target}g</div>
                <div className="text-xs text-muted-foreground mb-2">Proteínas</div>
                <MacroRing
                  value={macros.protein.current}
                  target={macros.protein.target}
                  color="protein"
                  size="sm"
                  icon={<FlatIcon name="sr-drumstick" style={{ color: '#dd6969' }} size={16} />}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-background/40 p-3 rounded-xl shadow-inner-dark">
              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold">{macros.carbs.target}g</div>
                <div className="text-xs text-muted-foreground mb-2">Carbohid.</div>
                <MacroRing
                  value={macros.carbs.current}
                  target={macros.carbs.target}
                  color="carbs"
                  size="sm"
                  icon={<FlatIcon name="sr-wheat" style={{ color: '#EB9F6D' }} size={16} />}
                />
              </div>
            </div>

            {/* Fats */}
            <div className="bg-background/40 p-3 rounded-xl shadow-inner-dark">
              <div className="flex flex-col items-center">
                <div className="text-sm font-semibold">{macros.fats.target}g</div>
                <div className="text-xs text-muted-foreground mb-2">Grasas</div>
                <MacroRing
                  value={macros.fats.current}
                  target={macros.fats.target}
                  color="fat"
                  size="sm"
                  icon={<FlatIcon name="sr-avocado" style={{ color: '#6C95DC' }} size={16} />}
                />
              </div>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <Button
          variant="secondary"
          className="w-full flex items-center justify-center"
          onClick={onAddFood}
        >
          <Plus className="h-4 w-4 mr-2" /> Añadir comidas
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MacrosCard;
