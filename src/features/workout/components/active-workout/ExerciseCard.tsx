
import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Clock, Copy, Pencil } from "lucide-react";
import { SetRow } from "./SetRow";
import { ExerciseNotesDialog } from "./ExerciseNotesDialog";
import { WorkoutExercise } from "../../types/workout";
import { useRestTimer } from "../../hooks/useRestTimer";
import { RestTimerModal } from "./RestTimerModal";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  onInputChange: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void;
  onAddSet: (exerciseIndex: number) => void;
  onNotesChange: (exerciseIndex: number, notes: string) => void;
  onViewDetails: (exerciseId: number) => void;
  onShowStats: (exerciseId: number) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  exerciseIndex,
  onInputChange,
  onAddSet,
  onNotesChange,
  onViewDetails,
  onShowStats
}) => {
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const restSeconds = useMemo(() => exercise.rest_between_sets_seconds ?? 60, [exercise.rest_between_sets_seconds]);
  const { remaining, duration, status, start, pause, resume, end, adjust } = useRestTimer(restSeconds);

  const handleNotesClick = () => {
    setShowNotesDialog(true);
  };

  const handleSaveNotes = (notes: string) => {
    onNotesChange(exerciseIndex, notes);
  };

  return (
    <>
      <Card key={`${exercise.id}-${exerciseIndex}`} className="bg-secondary/40 border border-white/5 overflow-hidden p-0">
        <div className="p-4">
          {/* Exercise Header */}
          <div className="flex items-center justify-between mb-3">
            <div 
              className="flex-1 cursor-pointer" 
              onClick={() => onViewDetails(exercise.id)}
            >
              <h3 className="font-medium text-base">{exercise.name}</h3>
              <p className="text-xs text-muted-foreground">
                {exercise.muscle_group_main}
                {exercise.equipment_required && ` • ${exercise.equipment_required}`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-white/5 bg-white/5"
                onClick={() => {
                  setShowTimerModal(true);
                  start(restSeconds);
                }}
              >
                <Clock className="h-5 w-5" />
              </Button>
              
              {/* Statistics button - icon only */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowStats(exercise.id)}
                className="px-2"
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Routine Creator Notes (Instructor Instructions) */}
          {exercise.notes && (
            <div className="mb-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Pencil className="h-3 w-3 text-blue-400" />
                <span className="text-xs font-medium text-blue-400">Notas del instructor</span>
              </div>
              <p className="text-sm text-foreground">{exercise.notes}</p>
            </div>
          )}


        <RestTimerModal
          open={showTimerModal}
          onOpenChange={setShowTimerModal}
          exerciseName={exercise.name}
          remaining={remaining}
          duration={duration}
          baseSeconds={restSeconds}
          status={status}
          onStart={() => start(restSeconds)}
          onPause={pause}
          onResume={resume}
          onEnd={() => {
            end();
            setShowTimerModal(false);
          }}
          onAdjust={adjust}
        />
          {/* Sets */}
          <div className="space-y-3">
            {/* Header for the table-like layout */}
            <div className="grid grid-cols-4 gap-2 px-2">
              <div className="text-xs font-medium text-muted-foreground">Serie</div>
              <div className="text-xs font-medium text-muted-foreground">Ant</div>
              <div className="text-xs font-medium text-muted-foreground">Peso</div>
              <div className="text-xs font-medium text-muted-foreground">Reps</div>
            </div>
            
            {exercise.sets.map((set, setIndex) => (
              <SetRow 
                key={`set-${setIndex}`} 
                set={set} 
                exerciseIndex={exerciseIndex}
                setIndex={setIndex}
                onInputChange={onInputChange}
              />
            ))}
          </div>
          
          {/* Exercise Actions */}
          <div className="mt-3 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => onAddSet(exerciseIndex)}
            >
              <Copy className="h-3 w-3 mr-1" />
              Añadir serie
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={handleNotesClick}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Notas
            </Button>
          </div>
        </div>
      </Card>

      {/* Notes Dialog */}
      <ExerciseNotesDialog
        isOpen={showNotesDialog}
        onClose={() => setShowNotesDialog(false)}
        exerciseName={exercise.name}
        notes={exercise.user_notes || ""}
        onSave={handleSaveNotes}
      />
    </>
  );
};
