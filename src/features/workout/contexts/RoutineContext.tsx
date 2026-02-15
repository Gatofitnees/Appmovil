
import React, { createContext, useContext, useState } from 'react';
import { RoutineExercise } from '../types';

// Define the shape of our context state
interface RoutineContextType {
  // State
  routineName: string;
  routineDescription: string;
  routineType: string;
  routineExercises: RoutineExercise[];
  isSubmitting: boolean;
  loadedRoutineId: number | null;

  // UI State
  showNoExercisesDialog: boolean;
  showSaveConfirmDialog: boolean;
  showDiscardChangesDialog: boolean;
  showExerciseOptionsSheet: boolean;
  showReorderSheet: boolean;
  currentExerciseIndex: number | null;
  pendingNavigation: string | null;

  // State setters
  setRoutineName: (name: string) => void;
  setRoutineDescription: (description: string) => void;
  setRoutineType: (type: string) => void;
  setRoutineExercises: (exercises: RoutineExercise[]) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setLoadedRoutineId: (id: number | null) => void;

  // UI State setters
  setShowNoExercisesDialog: (show: boolean) => void;
  setShowSaveConfirmDialog: (show: boolean) => void;
  setShowDiscardChangesDialog: (show: boolean) => void;
  setShowExerciseOptionsSheet: (show: boolean) => void;
  setShowReorderSheet: (show: boolean) => void;
  setCurrentExerciseIndex: (index: number | null) => void;
  setPendingNavigation: (path: string | null) => void;
}

// Create context with default values
const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

// Provider component
export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core routine state
  const [routineName, setRoutineName] = useState('');
  const [routineDescription, setRoutineDescription] = useState('');
  const [routineType, setRoutineType] = useState('');
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [showNoExercisesDialog, setShowNoExercisesDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [showDiscardChangesDialog, setShowDiscardChangesDialog] = useState(false);
  const [showExerciseOptionsSheet, setShowExerciseOptionsSheet] = useState(false);
  const [showReorderSheet, setShowReorderSheet] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [loadedRoutineId, setLoadedRoutineId] = useState<number | null>(null);

  const value = {
    // State
    routineName,
    routineDescription,
    routineType,
    routineExercises,
    isSubmitting,
    loadedRoutineId,

    // UI State
    showNoExercisesDialog,
    showSaveConfirmDialog,
    showDiscardChangesDialog,
    showExerciseOptionsSheet,
    showReorderSheet,
    currentExerciseIndex,
    pendingNavigation,

    // State setters
    setRoutineName,
    setRoutineDescription,
    setRoutineType,
    setRoutineExercises,
    setIsSubmitting,

    // UI State setters
    setShowNoExercisesDialog,
    setShowSaveConfirmDialog,
    setShowDiscardChangesDialog,
    setShowExerciseOptionsSheet,
    setShowReorderSheet,
    setCurrentExerciseIndex,
    setPendingNavigation,
    setLoadedRoutineId,
  };

  return (
    <RoutineContext.Provider value={value}>
      {children}
    </RoutineContext.Provider>
  );
};

// Hook to use the context
export const useRoutineContext = () => {
  const context = useContext(RoutineContext);

  if (context === undefined) {
    throw new Error('useRoutineContext must be used within a RoutineProvider');
  }

  return context;
};
