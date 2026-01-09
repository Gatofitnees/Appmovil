
import { useState, useCallback, useEffect } from "react";
import { WorkoutExercise } from "../types/workout";
import { useBaseExerciseData } from "./useBaseExerciseData";
import { usePreviousData } from "./usePreviousData";
import { useExerciseInputHandlers } from "./useExerciseInputHandlers";
import { useExerciseUIState } from "./useExerciseUIState";
import { useTemporaryExercises } from "./useTemporaryExercises";

export function useExerciseData(exerciseDetails: any[], routineId?: number, cachedData?: any) {
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<number, string>>({});

  // Use general exercise history (not limited to specific routine)
  const { previousData, exerciseNotesMap: previousNotesMap, previousDataLoaded } = usePreviousData(exerciseDetails);

  const { baseExerciseData, updateBaseExerciseData, clearStoredData } = useBaseExerciseData({
    exerciseDetails,
    previousData,
    exerciseNotesMap,
    previousDataLoaded,
    routineId,
    cachedBaseExercises: cachedData?.baseExercises
  });

  const {
    temporaryExercises,
    addTemporaryExercises,
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet,
    setTemporaryExercises
  } = useTemporaryExercises(routineId);

  // Load cached temporary exercises if available
  useEffect(() => {
    if (cachedData?.temporaryExercises && cachedData.temporaryExercises.length > 0 && temporaryExercises.length === 0) {
      console.log("🔄 Restoring temporary exercises from cache");
      setTemporaryExercises(cachedData.temporaryExercises);
    }
  }, [cachedData, setTemporaryExercises, temporaryExercises.length]);

  const {
    showStatsDialog,
    isReorderMode,
    setShowStatsDialog,
    handleToggleReorderMode
  } = useExerciseUIState();

  // Custom order state
  const [customOrder, setCustomOrder] = useState<number[]>([]);

  // Initialize customOrder when exercises load
  useEffect(() => {
    if (exerciseDetails.length > 0 && customOrder.length === 0) {
      const initialOrder = exerciseDetails.map(e => e.id);
      console.log("Setting initial exercise order:", initialOrder);
      setCustomOrder(initialOrder);
    }
  }, [exerciseDetails, customOrder.length]);

  // Create ordered base exercises list based on custom order or fallback to details
  const getOrderedBaseExercises = useCallback(() => {
    const sourceIds = customOrder.length > 0
      ? customOrder
      : exerciseDetails.map(detail => detail.id);

    return sourceIds
      .map(id => baseExerciseData[id])
      .filter(Boolean); // Remove any undefined entries
  }, [exerciseDetails, baseExerciseData, customOrder]);

  // Combine base exercises with temporary exercises
  const baseExercisesList = getOrderedBaseExercises();
  const allExercises = baseExercisesList.concat(temporaryExercises);
  const baseExerciseCount = baseExercisesList.length;

  const { handleInputChange, handleAddSet, handleReorderDrag: originalReorder } = useExerciseInputHandlers(
    allExercises,
    updateBaseExerciseData,
    temporaryExercises,
    addTemporaryExercises,
    updateTemporaryExercise,
    addTemporaryExerciseSet,
    baseExerciseCount
  );

  // Implement actual reorder logic
  const handleReorderDrag = useCallback((result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    // Only allow reordering base exercises for now (simplification)
    if (sourceIndex >= baseExerciseCount || destinationIndex >= baseExerciseCount) {
      console.warn("Reordering temporary exercises not yet fully supported mixing with base.");
      return;
    }

    console.log(`Reordering from ${sourceIndex} to ${destinationIndex}`);

    setCustomOrder(prevOrder => {
      const newOrder = Array.from(prevOrder);
      const [movedId] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(destinationIndex, 0, movedId);
      return newOrder;
    });

  }, [baseExerciseCount]);

  // Helper for manual move (for ReorderSheet)
  const moveExercise = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setCustomOrder(prevOrder => {
      // If no custom order yet, initialize it
      const currentOrder = prevOrder.length > 0
        ? [...prevOrder]
        : exerciseDetails.map(e => e.id);

      // Handle out of bounds or temporary exercises if needed
      // For now assuming only base exercises are passed here or handled by caller
      if (fromIndex >= currentOrder.length || toIndex >= currentOrder.length) return prevOrder;

      const [movedId] = currentOrder.splice(fromIndex, 1);
      currentOrder.splice(toIndex, 0, movedId);
      return currentOrder;
    });
  }, [exerciseDetails]);

  const handleExerciseNotesChange = useCallback((exerciseIndex: number, notes: string) => {
    const exercise = allExercises[exerciseIndex];
    if (!exercise) return;

    // Check if this is a temporary exercise
    const isTemporary = exerciseIndex >= baseExerciseCount;

    if (isTemporary) {
      // Use temporary exercise notes update function
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExerciseNotes(tempIndex, notes);
    } else {
      // Update the exercise data - user workout notes, not routine creator notes
      const updateExercise = (prev: WorkoutExercise) => ({
        ...prev,
        user_notes: notes // Update user workout notes, not routine creator notes
      });

      updateBaseExerciseData(exercise.id, updateExercise);
    }
  }, [allExercises, updateBaseExerciseData, updateTemporaryExerciseNotes, baseExerciseCount]);

  return {
    exercises: allExercises,
    baseExercises: baseExerciseData,
    temporaryExercises,
    showStatsDialog,
    isReorderMode,
    handleInputChange,
    handleExerciseNotesChange,
    handleAddSet,
    handleReorderDrag,
    moveExercise,
    setShowStatsDialog,
    handleToggleReorderMode,
    addTemporaryExercises,
    clearTemporaryExercises: () => {
      clearTemporaryExercises();
      clearStoredData();
    }
  };
}
