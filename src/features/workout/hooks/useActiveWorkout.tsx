import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRoutineDetail } from "./useRoutineDetail";
import { useExerciseData } from "./useExerciseData";
import { useSaveWorkout } from "./useSaveWorkout";
import { useWorkoutNavigation } from "./useWorkoutNavigation";
import { useWorkoutCache } from "./useWorkoutCache";
import { useDebounce } from "@/hooks/useDebounce";

export function useActiveWorkout(routineId: number | undefined, cachedStartTime?: string) {
  const [workoutStartTime] = useState<Date>(cachedStartTime ? new Date(cachedStartTime) : new Date());
  const location = useLocation();
  const { routine, exerciseDetails, loading } = useRoutineDetail(routineId);
  const { saveWorkoutCache, clearCache, loadWorkoutCache } = useWorkoutCache();

  // Load cached data if available
  const cachedData = location.state?.fromCache ? loadWorkoutCache() : null;

  const {
    exercises,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleReorderDrag,
    setShowStatsDialog,
    handleToggleReorderMode,
    addTemporaryExercises,
    clearTemporaryExercises,
    baseExercises,
    temporaryExercises,
    moveExercise
  } = useExerciseData(exerciseDetails, routineId, cachedData);

  // Debounce exercises to avoid too frequent cache updates
  const debouncedExercises = useDebounce(exercises, 2000);

  const {
    isSaving,
    handleSaveWorkout: originalSaveWorkout,
    showSummary,
    summaryStats,
    xpGained,
    finalDuration,
    handleCloseSummary
  } = useSaveWorkout(routine, workoutStartTime, exercises, clearTemporaryExercises, routineId, clearCache);

  const {
    handleBack: originalHandleBack,
    handleViewExerciseDetails,
    handleAddExercise: originalHandleAddExercise,
    showDiscardDialog,
    confirmDiscardChanges: originalConfirmDiscardChanges,
    cancelDiscardChanges
  } = useWorkoutNavigation(routineId);

  // Auto-save workout to cache (debounced)
  useEffect(() => {
    if (routine && routineId && debouncedExercises.length > 0) {
      // Only save if there's actual data (at least one set with weight or reps)
      const hasData = debouncedExercises.some(ex =>
        ex.sets.some(set => set.weight || set.reps)
      );

      if (hasData) {
        console.log('💾 Auto-saving workout to cache...');
        saveWorkoutCache(
          routineId,
          routine.name,
          workoutStartTime,
          baseExercises,
          temporaryExercises
        );
      }
    }
  }, [debouncedExercises, routine, routineId, workoutStartTime, baseExercises, temporaryExercises, saveWorkoutCache]);

  // Handle incoming temporary exercises from exercise selection with improved logic
  useEffect(() => {
    if (location.state?.selectedExercises && location.state?.isTemporary) {
      console.log("Processing selected temporary exercises:", location.state.selectedExercises);
      addTemporaryExercises(location.state.selectedExercises);

      // Clear the state immediately to prevent re-adding on re-renders
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state?.selectedExercises, location.state?.isTemporary, addTemporaryExercises]);

  // Enhanced handleBack to clear temporary exercises and cache
  const handleBack = () => {
    clearTemporaryExercises();
    clearCache();
    originalHandleBack();
  };

  // Enhanced confirmDiscardChanges to clear temporary exercises and cache
  const confirmDiscardChanges = () => {
    clearTemporaryExercises();
    clearCache();
    originalConfirmDiscardChanges();
  };

  // Enhanced handleAddExercise to pass current exercises
  const handleAddExercise = () => {
    originalHandleAddExercise(exercises);
  };

  // Enhanced handleSaveWorkout - remove the immediate clearing
  const handleSaveWorkout = async () => {
    try {
      await originalSaveWorkout();
      // clearTemporaryExercises is now handled inside useSaveWorkout after navigation
    } catch (error) {
      console.error("Error saving workout:", error);
      // Don't clear temporary exercises if save failed
    }
  };

  return {
    routine,
    exercises,
    loading,
    isSaving,
    showSummary,
    summaryStats,
    xpGained,
    finalDuration,
    handleCloseSummary,
    showStatsDialog,
    showDiscardDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleBack,
    handleSaveWorkout,
    handleReorderDrag,
    moveExercise,
    handleViewExerciseDetails,
    handleAddExercise,
    confirmDiscardChanges,
    cancelDiscardChanges,
    setShowStatsDialog,
    handleToggleReorderMode,
    workoutStartTime
  };
}
