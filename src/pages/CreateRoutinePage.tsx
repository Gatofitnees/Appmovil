
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RoutinePageHeader from "@/features/workout/components/RoutinePageHeader";
import RoutineFormContainer from "@/features/workout/components/RoutineFormContainer";
import RoutineDialogs from "@/features/workout/components/dialogs/RoutineDialogs";
import RoutineSheets from "@/features/workout/components/sheets/RoutineSheets";
import { useCreateRoutine } from "@/features/workout/hooks/useCreateRoutine";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/features/workout/components/active-workout/LoadingSkeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import Button from "@/components/Button";
import AICreationModal from "@/features/ai-routine/components/AICreationModal";
import { RoutineExercise } from "@/features/workout/types";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumModal } from "@/components/premium/PremiumModal";

const CreateRoutinePage: React.FC = () => {
  const { toast } = useToast();
  const { routineId } = useParams<{ routineId?: string }>();
  const isEditing = !!routineId;
  const [showAIModal, setShowAIModal] = useState(false);
  const { isPremium } = useSubscription();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Para edición, siempre empezamos cargando. Para creación, nunca cargamos inicialmente.
  const [isDataLoaded, setIsDataLoaded] = useState(!isEditing);

  const {
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
    handleBackClick,
    handleExerciseUpdate,

    // Loading/Editing state
    loadRoutineData,
    isLoading
  } = useCreateRoutine([], isEditing ? parseInt(routineId) : undefined);

  // Cargar datos de la rutina si estamos en modo edición
  useEffect(() => {
    const loadData = async () => {
      if (isEditing && routineId) {
        try {
          await loadRoutineData(parseInt(routineId));
        } catch (error) {
          console.error("Error loading routine data:", error);
        } finally {
          // Marcar como cargado cuando termina la carga (exitosa o con error)
          setIsDataLoaded(true);
        }
      }
    };

    loadData();
  }, [isEditing, routineId, loadRoutineData]);

  // Add a beforeUnload event handler to warn about unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (routineName || routineType || routineExercises.length > 0) {
        const message = "¿Está seguro que desea salir? Los cambios no guardados se perderán.";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [routineName, routineType, routineExercises]);

  // Mostrar loading skeleton hasta que los datos estén completamente cargados
  if (!isDataLoaded) {
    return <LoadingSkeleton onBack={handleBackClick} />;
  }

  const handleRoutineGenerated = (exercises: RoutineExercise[], name: string, description: string) => {
    console.log('🔍 handleRoutineGenerated received exercises:', JSON.stringify(exercises.map(e => ({
      name: e.name,
      id: e.id,
      exercise_id: e.exercise_id
    })), null, 2));

    setRoutineName(name);
    setRoutineDescription(description);
    setRoutineExercises(exercises);
    setShowAIModal(false);

    toast({
      title: "¡Rutina Generada!",
      description: "La IA ha creado tu rutina. Revisa los ejercicios y guarda.",
      duration: 4000,
    });
  };

  const handleAIButtonClick = () => {
    // AI Routine Creator is now premium-only
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setShowAIModal(true);
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      <RoutinePageHeader
        onSaveClick={handleSaveRoutineStart}
        onBackClick={handleBackClick}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />

      <RoutineFormContainer
        routineName={routineName}
        routineDescription={routineDescription}
        routineType={routineType}
        routineExercises={routineExercises}
        validationErrors={validationErrors}
        onNameChange={setRoutineName}
        onDescriptionChange={setRoutineDescription}
        onTypeChange={setRoutineType}
        handleAddSet={handleAddSet}
        handleSetUpdate={handleSetUpdate}
        handleRemoveSet={handleRemoveSet}
        handleExerciseOptions={handleExerciseOptions}
        handleReorderClick={handleReorderClick}
        handleSelectExercises={handleSelectExercises}
        onSave={handleSaveRoutineStart}
        onExerciseUpdate={handleExerciseUpdate}
        isEditing={isEditing}
        onAIButtonClick={handleAIButtonClick}
      />

      {/* Dialog Components */}
      <RoutineDialogs
        showNoExercisesDialog={showNoExercisesDialog}
        setShowNoExercisesDialog={setShowNoExercisesDialog}
        showSaveConfirmDialog={showSaveConfirmDialog}
        setShowSaveConfirmDialog={setShowSaveConfirmDialog}
        showDiscardChangesDialog={showDiscardChangesDialog}
        setShowDiscardChangesDialog={setShowDiscardChangesDialog}
        handleSaveRoutine={handleSaveRoutine}
        handleDiscardChanges={handleDiscardChanges}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />

      {/* AI Creation Modal */}
      <AICreationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onRoutineGenerated={handleRoutineGenerated}
      />

      {/* Sheet Components */}
      <RoutineSheets
        showExerciseOptionsSheet={showExerciseOptionsSheet}
        setShowExerciseOptionsSheet={setShowExerciseOptionsSheet}
        showReorderSheet={showReorderSheet}
        setShowReorderSheet={setShowReorderSheet}
        currentExerciseIndex={currentExerciseIndex}
        handleRemoveExercise={handleRemoveExercise}
        handleMoveExercise={handleMoveExercise}
        routineExercises={routineExercises}
        navigateToSelectExercises={handleSelectExercises}
        handleReorderSave={handleReorderSave}
      />

      {/* Premium Modal for AI Routine Creator */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="ai_routine_creator"
      />
    </div>
  );
};

export default CreateRoutinePage;
