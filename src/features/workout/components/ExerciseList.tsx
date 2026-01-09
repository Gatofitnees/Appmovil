
import React from "react";
import { RoutineExercise } from "../types";
import ExerciseItem from "./ExerciseItem";
import Button from "@/components/Button";

interface ExerciseListProps {
  exercises: RoutineExercise[];
  onAddSet: (index: number) => void;
  onSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onExerciseOptions: (index: number) => void;
  onReorderClick: () => void;
  onExerciseUpdate?: (index: number, field: string, value: any) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onAddSet,
  onSetUpdate,
  onRemoveSet,
  onExerciseOptions,
  onReorderClick,
  onExerciseUpdate
}) => {
  return (
    <>
      <div className="flex justify-between items-center pt-2 px-1">
        <h3 className="text-lg font-semibold text-white">Ejercicios</h3>
        {exercises.length > 0 && (
          <Button
            className="h-8 bg-transparent hover:bg-white/5 text-white border border-white/5 hover:border-white/10"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              onReorderClick();
            }}
          >
            Ordenar
          </Button>
        )}
      </div>

      {exercises.length > 0 ? (
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <ExerciseItem
              key={`${exercise.id}-${index}`}
              exercise={exercise}
              index={index}
              onAddSet={onAddSet}
              onSetUpdate={onSetUpdate}
              onRemoveSet={onRemoveSet}
              onExerciseOptions={onExerciseOptions}
              onExerciseUpdate={(idx, field, val) => {
                if (onExerciseUpdate) {
                  onExerciseUpdate(index, field, val);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No hay ejercicios seleccionados
        </div>
      )}
    </>
  );
};

export default ExerciseList;
