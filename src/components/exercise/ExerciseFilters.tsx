import React from "react";
import { Filter } from "lucide-react";
import Button from "@/components/Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface ExerciseFiltersProps {
  muscleGroups: string[];
  equipmentTypes: string[];
  muscleFilters: string[];
  equipmentFilters: string[];
  onMuscleFilterToggle: (muscle: string) => void;
  onEquipmentFilterToggle: (equipment: string) => void;
  onClearFilters: () => void;
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  muscleGroups,
  equipmentTypes,
  muscleFilters,
  equipmentFilters,
  onMuscleFilterToggle,
  onEquipmentFilterToggle,
  onClearFilters
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filtrar
        </Button>
      </SheetTrigger>
      {/* Side Sheet (Right) with 90% width and Notch safety via top padding */}
      <SheetContent side="right" className="h-full w-[90vw] sm:max-w-md bg-zinc-950 border-l border-white/5 p-0 flex flex-col" hideCloseButton={true}>
        <SheetHeader className="px-6 py-4 pt-12 border-b border-white/5 flex flex-row items-center justify-between space-y-0 flex-none bg-zinc-950 z-10">
          <SheetTitle className="text-lg font-semibold">Filtrar Ejercicios</SheetTitle>
          <div className="flex items-center gap-4">
            <button
              onClick={onClearFilters}
              className="text-xs font-medium text-sky-500 hover:text-sky-400"
            >
              Limpiar filtro
            </button>
            <SheetClose className="text-muted-foreground hover:text-white transition-colors p-1">
              <X className="h-5 w-5" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="px-6 py-6 overflow-y-auto flex-1 pb-40">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Grupos Musculares</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {muscleGroups.map(muscle => (
              <div key={muscle} className="flex items-center space-x-2 bg-secondary/20 p-2 rounded-lg border border-white/5">
                <Checkbox
                  id={`muscle-${muscle}`}
                  checked={muscleFilters.includes(muscle)}
                  onCheckedChange={() => onMuscleFilterToggle(muscle)}
                  className="border-white/20 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                />
                <label
                  htmlFor={`muscle-${muscle}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {muscle}
                </label>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-medium mb-3 text-muted-foreground">Equipamiento</h3>
          <div className="grid grid-cols-2 gap-3">
            {equipmentTypes.map(equipment => (
              <div key={equipment} className="flex items-center space-x-2 bg-secondary/20 p-2 rounded-lg border border-white/5">
                <Checkbox
                  id={`equipment-${equipment}`}
                  checked={equipmentFilters.includes(equipment)}
                  onCheckedChange={() => onEquipmentFilterToggle(equipment)}
                  className="border-white/20 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                />
                <label
                  htmlFor={`equipment-${equipment}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {equipment}
                </label>
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-zinc-950/90 backdrop-blur-sm border-t border-white/10 z-20">
          <SheetClose asChild>
            <Button variant="primary" fullWidth className="h-12 text-base">
              Aplicar Filtros
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ExerciseFilters;
