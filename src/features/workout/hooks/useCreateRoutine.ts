
import { useCallback, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRoutineContext } from "../contexts/RoutineContext";
import { useRoutinePersistence } from "./useRoutinePersistence";
import { useRoutineNavigation } from "./navigation";
import { useRoutineSheets } from "./useRoutineSheets";
import { useRoutineSave } from "./useRoutineSave";
import { useRoutineForm } from "./useRoutineForm";
import { RoutineExercise } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { convertRoutineTypeToUi } from "../utils/routineTypeMapping";

export const useCreateRoutine = (initialExercises: RoutineExercise[] = [], editRoutineId?: number) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get context state and setters
  const {
    routineName,
    routineDescription,
    routineType,
    routineExercises,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    loadedRoutineId,
    setRoutineName,
    setRoutineDescription,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    setLoadedRoutineId,
  } = useRoutineContext();

  const location = useLocation();

  // Handle returning from Exercise Selection
  useEffect(() => {
    if (location.state?.selectedExercises && location.state?.shouldAddToExisting) {
      const newExercises = location.state.selectedExercises as RoutineExercise[];

      console.log("Recibiendo ejercicios seleccionados:", newExercises.length);

      // Create a map of existing exercises for quick lookup by ID to prevent duplicates
      const existingMap = new Map(routineExercises.map(ex => [ex.id, ex]));

      // Filter out exercises that are already in the routine
      const uniqueNewExercises = newExercises.filter(newEx => !existingMap.has(newEx.id));

      // Append the new unique exercises to the existing list
      // This preserves the order of existing exercises and their sets/reps
      const finalExercises = [...routineExercises, ...uniqueNewExercises];

      setRoutineExercises(finalExercises);

      // Clear the state to prevent reprocessing (though useEffect dependency protects us mostly)
      // modifying history might be risky during render, but this effect runs after.
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setRoutineExercises, routineExercises]);


  // Initialize form handling
  const {
    validationErrors,
    handleAddSet,
    handleSetUpdate,
    handleRemoveExercise,
    handleRemoveSet,
    handleMoveExercise,
    handleExerciseUpdate,
  } = useRoutineForm(
    routineExercises,
    routineName,
    routineType,
    setRoutineExercises
  );

  // Set up persistence
  useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    editRoutineId
  );

  // Set up navigation handlers
  const {
    handleNavigateAway,
    handleBackClick,
    handleSelectExercises,
    handleDiscardChanges
  } = useRoutineNavigation(editRoutineId);

  // Set up sheet handlers
  const {
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave
  } = useRoutineSheets();

  // Set up save handlers
  const {
    handleSaveRoutineStart,
    handleSaveRoutine
  } = useRoutineSave(editRoutineId);

  // Función para cargar los datos de la rutina a editar
  const loadRoutineData = useCallback(async (routineId: number) => {
    // Si ya tenemos cargada esta rutina, no volver a pedirla
    if (loadedRoutineId === routineId) {
      console.log("Rutina ya cargada en memoria, omitiendo fetch.");
      return;
    }

    setIsLoading(true);
    try {
      // Obtener datos de la rutina
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();

      if (routineError || !routineData) {
        throw routineError || new Error("No se encontró la rutina");
      }

      // Establecer nombre y tipo (convertir de DB a UI)
      setRoutineName(routineData.name);
      setRoutineDescription(routineData.description || "");
      setRoutineType(convertRoutineTypeToUi(routineData.type) || "general");

      // Obtener ejercicios de la rutina
      const { data: routineExercisesData, error: exercisesError } = await supabase
        .from('routine_exercises')
        .select(`
          *,
          exercise:exercise_id(*)
        `)
        .eq('routine_id', routineId)
        .order('exercise_order', { ascending: true });

      if (exercisesError) {
        throw exercisesError;
      }

      if (routineExercisesData && routineExercisesData.length > 0) {
        // Formatear datos de ejercicios
        const formattedExercises = routineExercisesData.map(item => {
          const exerciseData = item.exercise as any;
          return {
            id: exerciseData.id,
            name: exerciseData.name,
            muscle_group_main: exerciseData.muscle_group_main,
            equipment_required: exerciseData.equipment_required,
            sets: Array(item.sets || 1).fill({}).map((_, idx) => ({
              set_number: idx + 1,
              reps_min: item.reps_min || 0,
              reps_max: item.reps_max || 0,
              rest_seconds: item.rest_between_sets_seconds || 60
            })),
            notes: item.notes || ""
          };
        });

        setRoutineExercises(formattedExercises);
      }

      // Marcar como cargada para evitar sobrescrituras futuras
      setLoadedRoutineId(routineId);

      console.log("Rutina cargada para edición:", routineData.name);
    } catch (error: any) {
      console.error("Error al cargar la rutina:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la rutina para editar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setRoutineName, setRoutineType, setRoutineExercises, toast, loadedRoutineId, setLoadedRoutineId]);

  return {
    // State
    routineName,
    routineDescription,
    routineType,
    routineExercises,
    validationErrors,
    isSubmitting,
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    isLoading,

    // State setters
    setRoutineName,
    setRoutineDescription,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,

    // Handlers
    handleAddSet,
    handleSetUpdate,
    handleRemoveSet,
    handleRemoveExercise,
    handleMoveExercise,
    handleSelectExercises,
    handleExerciseOptions,
    handleReorderClick,
    handleReorderSave,
    handleSaveRoutineStart,
    handleSaveRoutine,
    handleDiscardChanges,
    handleNavigateAway,
    handleBackClick,
    handleExerciseUpdate,

    // Carga de datos para edición
    loadRoutineData
  };
};
