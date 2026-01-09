
import React from "react";
import { Plus, Sparkles } from "lucide-react";
import Button from "@/components/Button";
import { RoutineExercise } from "../types";
import RoutineForm from "./RoutineForm";
import ExerciseList from "./ExerciseList";

interface RoutineFormContainerProps {
  routineName: string;
  routineType: string;
  routineExercises: RoutineExercise[];
  validationErrors: {
    name: boolean;
    type: boolean;
  };
  onNameChange: (name: string) => void;
  onTypeChange: (type: string) => void;
  handleAddSet: (index: number) => void;
  handleSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  handleRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  handleExerciseOptions: (index: number) => void;
  handleReorderClick: () => void;
  handleSelectExercises: (e: React.MouseEvent) => void;
  onSave?: () => void;
  onExerciseUpdate?: (index: number, field: string, value: any) => void;
  isEditing?: boolean;
  onAIButtonClick?: () => void;
}

const RoutineFormContainer: React.FC<RoutineFormContainerProps> = ({
  routineName,
  routineType,
  routineExercises,
  validationErrors,
  onNameChange,
  onTypeChange,
  handleAddSet,
  handleSetUpdate,
  handleRemoveSet,
  handleExerciseOptions,
  handleReorderClick,
  handleSelectExercises,
  onSave,
  onExerciseUpdate,
  isEditing = false,
  onAIButtonClick
}) => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Title */}
      <div className="flex items-center gap-2 px-1">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Editar Rutina" : "Crear Nueva Rutina"}
        </h1>

        {!isEditing && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAIButtonClick?.();
            }}
            className="group relative w-10 h-10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            type="button"
          >
            {/* Gradient Border - Thicker and Round */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full p-[2.5px]">
              <div className="h-full w-full bg-background rounded-full" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>
          </button>
        )}
      </div>

      <form className="space-y-8" onSubmit={(e) => {
        // We handle submission via the button click manually if needed, or let the form submit naturally if it were a real form action.
        // But here we want to pass the event up if it's not handled.
        // Actually, the main page handles logic.
        // Let's just make sure the button has onClick that calls the parent's submit if it exists?
        // Wait, the parent `CreateRoutinePage` passes props but `RoutineFormContainer` doesn't seem to have an `onSubmit` prop.
        // It relies on `isEditing`? No.
        // The user said "el de la parte superior si funciona bien".
        // Let's check `RoutinePageHeader.tsx` which likely has the top button.
        e.preventDefault();
      }}>
        <RoutineForm
          routineName={routineName}
          routineType={routineType}
          validationErrors={validationErrors}
          onNameChange={onNameChange}
          onTypeChange={onTypeChange}
        />

        <div className="space-y-4">
          <ExerciseList
            exercises={routineExercises}
            onAddSet={handleAddSet}
            onSetUpdate={handleSetUpdate}
            onRemoveSet={handleRemoveSet}
            onExerciseOptions={handleExerciseOptions}
            onReorderClick={handleReorderClick}
            onExerciseUpdate={onExerciseUpdate}
          />
        </div>

        <div className="pt-4 space-y-4">
          <Button
            variant="outline"
            fullWidth
            className="h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={(e) => {
              e.preventDefault();
              handleSelectExercises(e);
            }}
            type="button"
          >
            {routineExercises.length > 0 ? 'Añadir otro ejercicio' : 'Añadir Ejercicios'}
          </Button>

          <Button
            variant="primary"
            fullWidth
            className="h-12 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl shadow-none"
            onClick={(e) => {
              e.preventDefault();
              if (onSave) {
                onSave();
              }
            }}
            type="button"
          >
            {isEditing ? "Guardar cambios" : "Guardar rutina"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RoutineFormContainer;
