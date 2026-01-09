
import React from "react";
import { ArrowLeft } from "lucide-react";
import ExerciseSearch from "@/components/exercise/ExerciseSearch";
import ExerciseFilters from "@/components/exercise/ExerciseFilters";

interface ExerciseSelectionHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  muscleGroups: string[];
  equipmentTypes: string[];
  muscleFilters: string[];
  equipmentFilters: string[];
  onMuscleFilterToggle: (muscle: string) => void;
  onEquipmentFilterToggle: (equipment: string) => void;
  onNavigateBack: () => void;
  onClearFilters: () => void;
}

const ExerciseSelectionHeader: React.FC<ExerciseSelectionHeaderProps> = ({
  searchTerm,
  onSearchChange,
  muscleGroups,
  equipmentTypes,
  muscleFilters,
  equipmentFilters,
  onMuscleFilterToggle,
  onEquipmentFilterToggle,
  onNavigateBack,
  onClearFilters,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-background p-4 border-b border-muted/20">
      <div className="flex items-center mb-4">
        <button
          onClick={onNavigateBack}
          className="mr-3 p-1 rounded-full hover:bg-secondary/50"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Seleccionar Ejercicios</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-2">
        <ExerciseSearch
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        <ExerciseFilters
          muscleGroups={muscleGroups}
          equipmentTypes={equipmentTypes}
          muscleFilters={muscleFilters}
          equipmentFilters={equipmentFilters}
          onMuscleFilterToggle={onMuscleFilterToggle}
          onEquipmentFilterToggle={onEquipmentFilterToggle}
          onClearFilters={onClearFilters}
        />
      </div>
    </div>
  );
};

export default ExerciseSelectionHeader;
