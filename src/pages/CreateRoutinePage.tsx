
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

const CreateRoutinePage: React.FC = () => {
  const { toast } = useToast();
  const { routineId } = useParams<{ routineId?: string }>();
  const isEditing = !!routineId;
  const [showAIModal, setShowAIModal] = useState(false);

  // Para edición, siempre empezamos cargando. Para creación, nunca cargamos inicialmente.
  const [isDataLoaded, setIsDataLoaded] = useState(!isEditing);

  const {
    // State
    routineName,
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
    setRoutineType,
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
    handleNotesUpdate,

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
        routineType={routineType}
        routineExercises={routineExercises}
        validationErrors={validationErrors}
        onNameChange={setRoutineName}
        onTypeChange={setRoutineType}
        handleAddSet={handleAddSet}
        handleSetUpdate={handleSetUpdate}
        handleRemoveSet={handleRemoveSet}
        handleExerciseOptions={handleExerciseOptions}
        handleReorderClick={handleReorderClick}
        handleSelectExercises={handleSelectExercises}
        onSave={handleSaveRoutineStart}
        onExerciseUpdate={handleNotesUpdate}
        isEditing={isEditing}
        onAIButtonClick={() => setShowAIModal(true)}
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

      {/* AI Coming Soon Dialog */}
      <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
        <DialogContent className="sm:max-w-md border-primary/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader className="space-y-4 items-center text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Gatofit AI Magic
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground pt-2">
              Estamos entrenando a nuestra IA para crear rutinas personalizadas de nivel olímpico.
              <br /><br />
              <span className="font-medium text-foreground">Proximamente solo para usuarios Premium.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-2">
            <Button
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
              onClick={() => setShowAIModal(false)}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default CreateRoutinePage;
