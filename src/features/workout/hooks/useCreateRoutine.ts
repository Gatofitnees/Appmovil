
import { useCallback, useState } from "react";
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
    setRoutineName,
    setRoutineDescription,
    setRoutineType,
    setRoutineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
  } = useRoutineContext();

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
            notes: ""
          };
        });

        setRoutineExercises(formattedExercises);
      }

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
  }, [setRoutineName, setRoutineType, setRoutineExercises, toast]);

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
