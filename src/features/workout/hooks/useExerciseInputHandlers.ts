import { useCallback } from "react";
import { WorkoutExercise } from "../types/workout";

export function useExerciseInputHandlers(
  allExercises: WorkoutExercise[],
  updateBaseExerciseData: (exerciseId: number, updater: (prev: WorkoutExercise) => WorkoutExercise) => void,
  temporaryExercises: WorkoutExercise[],
  addTemporaryExercises: (exercises: WorkoutExercise[]) => void,
  updateTemporaryExercise: (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => void,
  addTemporaryExerciseSet: (exerciseIndex: number) => void,
  baseExerciseCount: number
) {
  const handleInputChange = useCallback((exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const exercise = allExercises[exerciseIndex];
    if (!exercise) return;

    console.log(`Input change - Exercise ${exerciseIndex}, Set ${setIndex}, Field ${field}, Value: "${value}"`);

    // Check if this is a temporary exercise
    const isTemporary = exerciseIndex >= baseExerciseCount;

    // Parse value with improved decimal support for weight
    const parseValue = (val: string, isWeight: boolean) => {
      if (val === '') return null;

      if (isWeight) {
        // For weight, allow trailing dots and preserve them during input
        const normalizedVal = val.replace(',', '.');

        // If the value ends with a dot and it's a valid decimal start, keep it as string
        if (normalizedVal.endsWith('.') && /^\d+\.$/.test(normalizedVal)) {
          console.log(`Keeping trailing dot for weight input: "${val}" -> "${normalizedVal}"`);
          return normalizedVal; // Return as string to preserve the dot
        }

        // If it's a valid decimal number, parse it
        if (/^\d*\.?\d*$/.test(normalizedVal) && normalizedVal !== '.') {
          const numValue = parseFloat(normalizedVal);
          if (!isNaN(numValue)) {
            console.log(`Parsing weight "${val}" -> "${normalizedVal}" -> ${numValue}`);
            return numValue;
          }
        }

        return null;
      } else {
        // For reps, only integers
        const numValue = parseInt(val);
        return isNaN(numValue) ? null : numValue;
      }
    };

    const parsedValue = parseValue(value, field === 'weight');
    console.log(`Parsed value:`, parsedValue);

    if (isTemporary) {
      // Use temporary exercise update function
      const tempIndex = exerciseIndex - baseExerciseCount;
      updateTemporaryExercise(tempIndex, setIndex, field, value);
    } else {
      // Use base exercise update function
      const updateExercise = (prev: WorkoutExercise) => ({
        ...prev,
        sets: prev.sets.map((set, i) =>
          i === setIndex
            ? { ...set, [field]: parsedValue }
            : set
        )
      });

      updateBaseExerciseData(exercise.id, updateExercise);
    }
  }, [allExercises, updateBaseExerciseData, updateTemporaryExercise, baseExerciseCount]);

  const handleAddSet = useCallback((exerciseIndex: number) => {
    const exercise = allExercises[exerciseIndex];
    if (!exercise) return;

    // Check if this is a temporary exercise
    const isTemporary = exerciseIndex >= baseExerciseCount;

    if (isTemporary) {
      // Use temporary exercise add set function
      const tempIndex = exerciseIndex - baseExerciseCount;
      addTemporaryExerciseSet(tempIndex);
    } else {
      // Use base exercise add set function
      const updateExercise = (prev: WorkoutExercise) => {
        const newSetNumber = prev.sets.length + 1;
        const lastSet = prev.sets[prev.sets.length - 1];

        const newSet = {
          set_number: newSetNumber,
          weight: null,
          reps: null,
          notes: "",
          previous_weight: null,
          previous_reps: null,
          target_reps_min: lastSet?.target_reps_min,
          target_reps_max: lastSet?.target_reps_max,
          target_reps_range: lastSet?.target_reps_range
        };

        return {
          ...prev,
          sets: [...prev.sets, newSet]
        };
      };

      updateBaseExerciseData(exercise.id, updateExercise);
    }
  }, [allExercises, updateBaseExerciseData, addTemporaryExerciseSet, baseExerciseCount]);

  const handleReorderDrag = useCallback((result: any) => {
    // Placeholder for reorder functionality
    console.log("Reorder drag:", result);
    return result;
  }, []);

  return {
    handleInputChange,
    handleAddSet,
    handleReorderDrag
  };
}
