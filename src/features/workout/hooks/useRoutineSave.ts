
import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { saveRoutine, updateRoutine } from "../services/routineService";
import { useRoutineContext } from "../contexts/RoutineContext";
import { useRoutinePersistence } from "./useRoutinePersistence";
import { useSubscription } from "@/hooks/useSubscription";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { toast as sonnerToast } from "sonner";

export const useRoutineSave = (editRoutineId?: number) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  const { incrementUsage, checkLimitWithoutFetch, showLimitReachedToast } = useUsageLimits();
  const saveInProgressRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    routineName,
    routineDescription,
    routineType,
    routineExercises,
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setIsSubmitting,
    setRoutineName,
    setRoutineDescription,
    setRoutineType,
    setRoutineExercises
  } = useRoutineContext();

  const { clearStoredRoutine } = useRoutinePersistence(
    routineName,
    routineType,
    routineExercises,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    editRoutineId
  );

  const validateForm = useCallback(() => {
    if (!routineName || routineName.trim() === '') {
      toast({
        title: "Error",
        description: "Escribe un nombre a la rutina",
        variant: "destructive"
      });
      return false;
    }

    if (!routineType || routineType.trim() === '') {
      toast({
        title: "Error",
        description: "Selecciona el tipo de rutina",
        variant: "destructive"
      });
      return false;
    }

    return true;
  }, [routineName, routineType, toast]);

  const handleSaveRoutineStart = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    // Solo verificar límites si es una rutina nueva (no edición)
    if (!editRoutineId) {
      const limitCheck = checkLimitWithoutFetch('routines', isPremium);

      if (!limitCheck.canProceed) {
        showLimitReachedToast('routines');
        return;
      }
    }

    if (routineExercises.length === 0) {
      setShowNoExercisesDialog(true);
      return;
    }

    setShowSaveConfirmDialog(true);
  }, [validateForm, routineExercises, setShowNoExercisesDialog, setShowSaveConfirmDialog, editRoutineId, checkLimitWithoutFetch, isPremium, showLimitReachedToast]);

  const handleSaveRoutine = useCallback(async () => {
    // Prevent concurrent saves
    if (saveInProgressRef.current) {
      console.warn("Save already in progress, ignoring duplicate save request");
      return;
    }

    try {
      saveInProgressRef.current = true;
      setIsSubmitting(true);

      sonnerToast.loading(editRoutineId ? "Actualizando rutina..." : "Guardando rutina...");
      console.log(editRoutineId ? "Actualizando rutina existente" : "Guardando nueva rutina");

      // Validar datos antes de guardar
      if (!routineName?.trim()) {
        throw new Error('El nombre de la rutina no puede estar vacío');
      }
      if (!routineType?.trim()) {
        throw new Error('Debe seleccionar un tipo de rutina');
      }
      if (!routineExercises || routineExercises.length === 0) {
        throw new Error('Debe agregar al menos un ejercicio');
      }

      // Set a timeout for the save operation (30 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        saveTimeoutRef.current = setTimeout(() => {
          reject(new Error('La operación de guardado tardó demasiado. Verifique su conexión e intente nuevamente.'));
        }, 30000);
      });

      // Race between save operation and timeout
      const savePromise = editRoutineId
        ? updateRoutine(
          editRoutineId,
          routineName,
          routineType,
          routineExercises,
          routineDescription
        )
        : saveRoutine(
          routineName,
          routineType,
          routineExercises,
          routineDescription
        );

      const savedRoutine = await Promise.race([savePromise, timeoutPromise]);

      // Clear timeout if save succeeded
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      // Solo incrementar contador para rutinas nuevas (no ediciones) y usuarios free
      if (savedRoutine && !editRoutineId && !isPremium) {
        await incrementUsage('routines');
      }

      console.log(editRoutineId
        ? "Rutina actualizada exitosamente:"
        : "Rutina guardada exitosamente:", savedRoutine);

      sonnerToast.dismiss();

      setRoutineName('');
      setRoutineDescription('');
      setRoutineType('');
      setRoutineExercises([]);
      clearStoredRoutine();

      setShowSaveConfirmDialog(false);

      toast({
        title: editRoutineId ? "¡Rutina actualizada!" : "¡Rutina creada!",
        description: editRoutineId
          ? `La rutina ${routineName} ha sido actualizada correctamente`
          : `La rutina ${routineName} ha sido guardada correctamente`,
        variant: "success"
      });

      console.log("Navigating to /workout after successful save");
      navigate("/workout");

    } catch (error: any) {
      console.error(editRoutineId ? "Error actualizando rutina:" : "Error guardando rutina:", error);

      // Clear timeout on error
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      sonnerToast.dismiss();

      const errorMsg = error?.message || "Ha ocurrido un error. Por favor, intente más tarde.";

      toast({
        title: editRoutineId ? "Error al actualizar" : "Error al guardar",
        description: errorMsg,
        variant: "destructive"
      });

    } finally {
      saveInProgressRef.current = false;
      setIsSubmitting(false);
      setShowSaveConfirmDialog(false);
    }
  }, [
    editRoutineId,
    routineName,
    routineType,
    routineExercises,
    navigate,
    toast,
    clearStoredRoutine,
    setIsSubmitting,
    setShowSaveConfirmDialog,
    setRoutineName,
    setRoutineType,
    setRoutineExercises,
    isPremium,
    incrementUsage
  ]);

  return {
    handleSaveRoutineStart,
    handleSaveRoutine,
  };
};
