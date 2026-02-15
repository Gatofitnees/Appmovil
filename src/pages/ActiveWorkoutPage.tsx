import React from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  WorkoutHeader,
  ExerciseList,
  ExerciseStatistics,
  LoadingSkeleton,
  RoutineNotFound,
  SaveButton
} from "@/features/workout/components/active-workout";
import { useActiveWorkout } from "@/features/workout/hooks/useActiveWorkout";
import { useWorkoutCache } from "@/features/workout/hooks/useWorkoutCache";
import DiscardChangesDialog from "@/features/workout/components/dialogs/DiscardChangesDialog";
import { Button } from "@/components/ui/button";
import { WorkoutSummaryModal } from "@/features/workout/components/WorkoutSummaryModal";
import ReorderSheet from "@/features/workout/components/sheets/ReorderSheet";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle, NotificationType } from "@capacitor/haptics";

const ActiveWorkoutPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const location = useLocation();
  const { loadWorkoutCache } = useWorkoutCache();

  // Check if we're recovering from cache
  const cachedData = location.state?.fromCache ? loadWorkoutCache() : null;
  const cachedStartTime = cachedData?.startTime;

  const {
    routine,
    exercises,
    loading,
    isSaving,
    showStatsDialog,
    showDiscardDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleBack,
    handleSaveWorkout,
    handleReorderDrag,
    handleViewExerciseDetails,
    handleAddExercise,
    confirmDiscardChanges,
    cancelDiscardChanges,
    setShowStatsDialog,
    handleToggleReorderMode,
    // Summary
    showSummary,
    summaryStats,
    xpGained,
    finalDuration,
    handleCloseSummary,
    moveExercise
  } = useActiveWorkout(routineId ? parseInt(routineId) : undefined, cachedStartTime);

  const { hapticImpact, hapticNotification } = useHaptics();

  // Haptic feedback on summary show
  React.useEffect(() => {
    if (showSummary) {
      hapticNotification(NotificationType.Success);
    }
  }, [showSummary]);

  if (loading) {
    return <LoadingSkeleton onBack={handleBack} />;
  }

  if (!routine) {
    return <RoutineNotFound onBack={handleBack} />;
  }

  // Find the exercise that matches the current statistics dialog
  const currentStatsExercise = exercises.find(ex => ex.id === showStatsDialog);

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <WorkoutHeader
        routineName={routine.name}
        isReorderMode={isReorderMode}
        isSaving={isSaving}
        onBack={handleBack}
        onToggleReorder={handleToggleReorderMode}
        onSave={handleSaveWorkout}
      />

      {/* Workout Info */}
      <div className="mb-6 p-3 bg-secondary/20 rounded-lg text-sm">
        <div className="flex items-center justify-between">
          <span>Tipo: {routine.description || "General"}</span>
          <span>Tiempo estimado: {routine.estimated_duration_minutes || 30} min</span>
        </div>
      </div>

      {/* Exercise List */}
      <ExerciseList
        exercises={exercises}
        isReorderMode={false} // Disable inline reorder in favor of Sheet
        routineId={routineId}
        onReorderDrag={handleReorderDrag}
        onInputChange={handleInputChange}
        onAddSet={handleAddSet}
        onNotesChange={handleExerciseNotesChange}
        onViewDetails={handleViewExerciseDetails}
        onShowStats={(exerciseId) => setShowStatsDialog(exerciseId)}
        onAddExercise={handleAddExercise}
      />

      {/* Save button (only at the bottom of the exercise list) */}
      {exercises.length > 0 && (
        <div className="mt-6 mb-20">
          <Button
            variant="default"
            className="w-full"
            onClick={() => {
              hapticImpact(ImpactStyle.Medium);
              handleSaveWorkout();
            }}
            disabled={isSaving}
          >
            {isSaving ? "Guardando entrenamiento..." : "Guardar entrenamiento"}
          </Button>
        </div>
      )}

      {/* Statistics Dialog */}
      {currentStatsExercise && showStatsDialog && (
        <ExerciseStatistics
          exerciseId={currentStatsExercise.id}
          exerciseName={currentStatsExercise.name}
          showStatsDialog={true}
          onCloseDialog={() => setShowStatsDialog(null)}
        />
      )}

      {/* Reorder Sheet */}
      <ReorderSheet
        open={isReorderMode}
        onOpenChange={(open) => !open && handleToggleReorderMode()}
        exercises={exercises}
        onMoveExercise={moveExercise}
        onSave={handleToggleReorderMode}
      />

      {/* Discard Changes Dialog */}
      <DiscardChangesDialog
        open={showDiscardDialog}
        onOpenChange={cancelDiscardChanges}
        onConfirm={confirmDiscardChanges}
      />

      {/* Summary Modal */}
      <WorkoutSummaryModal
        isOpen={showSummary}
        onClose={handleCloseSummary}
        stats={summaryStats}
        xpGained={xpGained}
        durationMinutes={finalDuration}
      />
    </div>
  );
};

export default ActiveWorkoutPage;
