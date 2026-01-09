import React from "react";
import { Plus, Grip, MoreVertical, FileEdit } from "lucide-react";
import Button from "@/components/Button";
import { RoutineExercise } from "../types";
import ExerciseSet from "./ExerciseSet";
import { ExerciseNotesDialog } from "./dialogs/ExerciseNotesDialog";
import { useNavigate } from "react-router-dom";

interface ExerciseItemProps {
  exercise: RoutineExercise;
  index: number;
  onAddSet: (index: number) => void;
  onSetUpdate: (exerciseIndex: number, setIndex: number, field: string, value: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onExerciseOptions: (index: number) => void;
  onExerciseUpdate: (index: number, field: string, value: any) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  index,
  onAddSet,
  onSetUpdate,
  onRemoveSet,
  onExerciseOptions,
  onExerciseUpdate
}) => {
  const navigate = useNavigate();

  const handleExerciseNameClick = () => {
    // Navigate to exercise details while preserving current route for return
    const currentPath = window.location.pathname;
    navigate(`/workout/exercise-details/${exercise.id}`, {
      state: { returnTo: currentPath }
    });
  };

  const [isNotesOpen, setIsNotesOpen] = React.useState(false);

  return (
    <>
      <div className="bg-secondary/40 rounded-xl overflow-hidden">
        <div className="p-4">
          {/* Header without grip */}
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h4
                className="font-medium text-base truncate pr-2 cursor-pointer hover:text-primary transition-colors text-white"
                onClick={handleExerciseNameClick}
              >
                {exercise.name}
              </h4>
              <span className="text-xs text-zinc-400 block truncate">{exercise.muscle_group_main}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-transparent border-0 hover:bg-white/10 text-zinc-400 shadow-none focus:ring-0"
              onClick={(e) => {
                e.preventDefault();
                onExerciseOptions(index);
              }}
              type="button"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-[50px_1fr_85px_30px] gap-3 mb-2 px-3">
            <div className="text-xs text-zinc-400 text-center font-medium">Serie</div>
            <div className="text-xs text-zinc-400 text-center font-medium">Reps</div>
            <div className="text-xs text-zinc-400 text-center font-medium">Descanso</div>
            <div className="text-xs text-zinc-400 text-center font-medium"></div>
          </div>

          {/* Sets List */}
          <div className="space-y-2 mb-4">
            {exercise.sets.map((set, setIndex) => (
              <ExerciseSet
                key={`set-${setIndex}`}
                set={set}
                setIndex={setIndex}
                onSetUpdate={(setIndex, field, value) => onSetUpdate(index, setIndex, field, value)}
                onRemoveSet={(setIndex) => onRemoveSet(index, setIndex)}
              />
            ))}
          </div>

          {/* Action Buttons: Add Set & Notes */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-lg border-white/5 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300 shadow-none"
              onClick={(e) => {
                e.preventDefault();
                onAddSet(index);
              }}
              type="button"
            >
              <Plus className="h-3 w-3 mr-2" />
              Añadir serie
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-lg border-white/5 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300 shadow-none"
              onClick={(e) => {
                e.preventDefault();
                setIsNotesOpen(true);
              }}
              type="button"
            >
              <FileEdit className="h-3 w-3 mr-2" />
              Notas
            </Button>
          </div>
        </div>
      </div>

      <ExerciseNotesDialog
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        onSave={(notes) => onExerciseUpdate(index, "notes", notes)}
        initialNotes={exercise.notes || ""}
        exerciseName={exercise.name}
      />
    </>
  );
};

export default ExerciseItem;
