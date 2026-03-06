
import { useState, useEffect, useCallback } from "react";
import { WorkoutExercise } from "../types/workout";

interface TemporaryExercise {
  id: number;
  name: string;
  muscle_group_main?: string;
  equipment_required?: string;
  sets: Array<{
    set_number: number;
    weight: number | null;
    reps: number | null;
    notes: string;
    previous_weight: number | null;
    previous_reps: number | null;
    rir?: number | null;
    partial_reps?: number | null;
  }>;
  notes: string; // Routine creator notes
  user_notes?: string; // User workout notes
}

// Helper function to create a valid set with proper set_number
const createValidSet = (setNumber: number) => ({
  set_number: setNumber,
  weight: null,
  reps: null,
  notes: "",
  previous_weight: null,
  previous_reps: null,
  rir: null,
  partial_reps: null
});

// Helper function to format exercises with valid sets
const formatExerciseWithValidSets = (exercise: any): TemporaryExercise => {
  // Ensure the exercise has at least one valid set
  let sets = exercise.sets || [];

  // If no sets or invalid sets, create one default set
  if (!sets.length || sets.some((set: any) => !set.set_number || set.set_number < 1)) {
    sets = [createValidSet(1)];
  } else {
    // Ensure all sets have valid set_numbers
    sets = sets.map((set: any, index: number) => ({
      ...set,
      set_number: set.set_number || (index + 1),
      weight: set.weight || null,
      reps: set.reps || null,
      notes: set.notes || "",
      previous_weight: set.previous_weight || null,
      previous_reps: set.previous_reps || null,
      rir: set.rir || null,
      partial_reps: set.partial_reps || null
    }));
  }

  return {
    id: exercise.id,
    name: exercise.name,
    muscle_group_main: exercise.muscle_group_main,
    equipment_required: exercise.equipment_required,
    sets: sets,
    notes: exercise.notes || "", // Routine creator notes
    user_notes: exercise.user_notes || "" // User workout notes
  };
};

export const useTemporaryExercises = (routineId: number | undefined) => {
  const [temporaryExercises, setTemporaryExercises] = useState<TemporaryExercise[]>([]);

  const getStorageKey = (id: number) => `temp_exercises_${id}`;

  // Load temporary exercises from sessionStorage on mount
  useEffect(() => {
    if (!routineId) return;

    const storageKey = getStorageKey(routineId);
    const stored = sessionStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate and fix loaded exercises
        const validatedExercises = parsed.map((ex: any) => formatExerciseWithValidSets(ex));
        setTemporaryExercises(validatedExercises);
        console.log("Loaded and validated temporary exercises from storage:", validatedExercises.length);
      } catch (error) {
        console.error("Error parsing temporary exercises:", error);
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [routineId]);

  // Save to sessionStorage whenever temporaryExercises changes
  useEffect(() => {
    if (!routineId) return;

    const storageKey = getStorageKey(routineId);

    if (temporaryExercises.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(temporaryExercises));
      console.log("Saved temporary exercises to storage:", temporaryExercises.length);
    } else {
      sessionStorage.removeItem(storageKey);
    }
  }, [temporaryExercises, routineId]);

  const addTemporaryExercises = useCallback((exercises: any[]) => {
    const formattedExercises: TemporaryExercise[] = exercises.map(exercise => {
      const formatted = formatExerciseWithValidSets(exercise);
      console.log(`Adding temporary exercise ${formatted.id} with ${formatted.sets.length} sets:`, formatted.sets);
      return formatted;
    });

    setTemporaryExercises(prev => {
      const existingIds = prev.map(ex => ex.id);
      const newExercises = formattedExercises.filter(ex => !existingIds.includes(ex.id));

      if (newExercises.length === 0) {
        console.log("No new exercises to add (duplicates filtered)");
        return prev;
      }

      console.log("Adding temporary exercises:", newExercises.length);
      return [...prev, ...newExercises];
    });
  }, []);

  const clearTemporaryExercises = useCallback(() => {
    if (!routineId) return;

    const storageKey = getStorageKey(routineId);
    sessionStorage.removeItem(storageKey);
    setTemporaryExercises([]);
    console.log("Cleared temporary exercises");
  }, [routineId]);

  const updateTemporaryExercise = useCallback((
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps' | 'rir' | 'partial_reps',
    value: string
  ) => {
    const numValue = value === '' ? null : Number(value);

    setTemporaryExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIndex] && updated[exerciseIndex].sets[setIndex]) {
        updated[exerciseIndex] = {
          ...updated[exerciseIndex],
          sets: updated[exerciseIndex].sets.map((set, i) =>
            i === setIndex
              ? { ...set, [field]: numValue }
              : set
          )
        };
        console.log(`Updated temporary exercise ${exerciseIndex} set ${setIndex} ${field} to:`, numValue);
      }
      return updated;
    });
  }, []);

  const updateTemporaryExerciseNotes = useCallback((exerciseIndex: number, notes: string) => {
    setTemporaryExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIndex]) {
        updated[exerciseIndex] = {
          ...updated[exerciseIndex],
          user_notes: notes // Update user workout notes, not routine creator notes
        };
      }
      return updated;
    });
  }, []);

  const addTemporaryExerciseSet = useCallback((exerciseIndex: number) => {
    setTemporaryExercises(prev => {
      const updated = [...prev];
      if (updated[exerciseIndex]) {
        const exercise = updated[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];

        const newSet = createValidSet(exercise.sets.length + 1);
        // Copy weight and reps from last set if available
        if (lastSet) {
          newSet.weight = lastSet.weight;
          newSet.reps = lastSet.reps;
        }

        updated[exerciseIndex] = {
          ...exercise,
          sets: [...exercise.sets, newSet]
        };
        console.log(`Added set ${newSet.set_number} to temporary exercise ${exerciseIndex}`);
      }
      return updated;
    });
  }, []);

  return {
    temporaryExercises,
    addTemporaryExercises,
    clearTemporaryExercises,
    updateTemporaryExercise,
    updateTemporaryExerciseNotes,
    addTemporaryExerciseSet,
    setTemporaryExercises
  };
};
