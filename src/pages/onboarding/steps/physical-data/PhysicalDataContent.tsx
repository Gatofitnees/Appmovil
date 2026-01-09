

import React from "react";
import UnitToggle from "./UnitToggle";
import MetricHeightSelector from "./MetricHeightSelector";
import ImperialHeightSelector from "./ImperialHeightSelector";
import WeightSelector from "./WeightSelector";
import BodyFatSelector from "./BodyFatSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface PhysicalDataContentProps {
  isMetric: boolean;
  onUnitChange: (checked: boolean) => void;
  heightValues: Array<{ label: string; value: number }>;
  inchesValues: Array<{ label: string; value: number }>;
  weightValues: Array<{ label: string; value: number }>;
  fatValues: Array<{ label: string; value: number }>;
  heightCm: number;
  heightFt: number;
  heightIn: number;
  weight: number;
  bodyFat: number;
  setHeightCm: (value: number) => void;
  setHeightFt: (value: number) => void;
  setHeightIn: (value: number) => void;
  setWeight: (value: number) => void;
  setBodyFat: (value: number) => void;
}

const PhysicalDataContent: React.FC<PhysicalDataContentProps> = ({
  isMetric,
  onUnitChange,
  heightValues,
  inchesValues,
  weightValues,
  fatValues,
  heightCm,
  heightFt,
  heightIn,
  weight,
  bodyFat,
  setHeightCm,
  setHeightFt,
  setHeightIn,
  setWeight,
  setBodyFat
}) => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Hablemos de ti</h1>

      <p className="text-muted-foreground mb-8">
        Esta información nos ayuda a personalizar tu experiencia
      </p>

      <UnitToggle isMetric={isMetric} onChange={onUnitChange} />

      <div className="flex justify-between w-full max-w-sm mx-auto px-4">
        <div className="flex flex-col items-center w-24">
          <label className="text-sm font-medium mb-3">Altura</label>
          <div className="w-full">
            {isMetric ? (
              <MetricHeightSelector
                heightValues={heightValues}
                heightCm={heightCm}
                onHeightChange={setHeightCm}
              />
            ) : (
              <ImperialHeightSelector
                heightValues={heightValues}
                inchesValues={inchesValues}
                heightFt={heightFt}
                heightIn={heightIn}
                onHeightFtChange={setHeightFt}
                onHeightInChange={setHeightIn}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col items-center w-24">
          <label className="text-sm font-medium mb-3">Peso</label>
          <div className="w-full">
            <WeightSelector
              weightValues={weightValues}
              weight={weight}
              onWeightChange={setWeight}
              unit={isMetric ? "kg" : "lb"}
            />
          </div>
        </div>

        <div className="flex flex-col items-center w-24">
          <div className="flex items-center justify-center gap-2 mb-3">
            <label className="text-sm font-medium">% Grasa</label>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="w-4 h-4 rounded-full border border-muted-foreground/50 flex items-center justify-center text-[10px] text-muted-foreground hover:bg-secondary transition-colors"
                >
                  i
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Por qué es importante el % de grasa?</DialogTitle>
                  <DialogDescription>
                    El porcentaje de grasa corporal es una medida más precisa que el peso total para evaluar tu composición corporal.
                    <br /><br />
                    Nos ayuda a calcular tus calorías de mantenimiento con mayor precisión y a establecer objetivos realistas de pérdida de grasa o ganancia muscular.
                    <br /><br />
                    Si no lo sabes con exactitud, una estimación visual es suficiente.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <div className="w-full">
            <BodyFatSelector
              fatValues={fatValues}
              bodyFat={bodyFat}
              onBodyFatChange={setBodyFat}
            />
          </div>
        </div>
      </div>

      <div className="h-40"></div> {/* Increased spacer for navigation bar */}
    </>
  );
};

export default React.memo(PhysicalDataContent);