
import React, { useState } from "react";
import { Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveProgramUnified } from "@/hooks/useActiveProgramUnified";
import ProgrammedRoutinesModal from "./ProgrammedRoutinesModal";
import { cn } from "@/lib/utils";

interface ProgrammedWorkoutButtonProps {
  onStartWorkout: (routineId: number) => void;
  showModal?: boolean;
  selectedDate: Date;
}

const ProgrammedWorkoutButton: React.FC<ProgrammedWorkoutButtonProps> = ({
  onStartWorkout,
  showModal = false,
  selectedDate
}) => {
  const { activeProgram, loading, isCompletedForSelectedDate, isCurrentDay } = useActiveProgramUnified(selectedDate);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show if loading
  if (loading) {
    return null;
  }

  // Don't show if no active program
  if (!activeProgram) {
    return null;
  }

  // Siempre mostrar el botón si hay un programa activo,
  // independientemente de si hay rutinas para el día seleccionado.
  // Esto permite al usuario navegar y revisar otros días.

  const handleButtonClick = () => {
    if (showModal) {
      // En HomePage, mostrar modal
      setIsModalOpen(true);
    } else {
      // En otros lugares, funcionalidad original
      if (activeProgram.routines && activeProgram.routines.length === 1 && isCurrentDay) {
        onStartWorkout(activeProgram.routines[0].routine_id);
      } else {
        setIsModalOpen(true);
      }
    }
  };

  const handleStartRoutine = (routineId: number) => {
    onStartWorkout(routineId);
  };

  const getButtonIcon = () => {
    // Original apple icon should persist for admin programs regardless of completion
    if (activeProgram?.type === 'admin') {
      return <i className="fi fi-sr-apple-dumbbell text-lg translate-y-0.5" />;
    }

    if (isCompletedForSelectedDate) {
      return <Check className="h-5 w-5" />;
    }

    return <Calendar className="h-5 w-5" />;
  };

  const getButtonStyle = () => {
    // Red styling for admin programs (always stays exactly the same)
    if (activeProgram?.type === 'admin') {
      return "w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-neu-button";
    }

    if (isCompletedForSelectedDate) {
      return "w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-neu-button border-2 border-green-500";
    }

    return "w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-neu-button";
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        size="icon"
        className={cn(getButtonStyle())}
      >
        {getButtonIcon()}
      </Button>

      {/* Modal for programmed routines */}
      <ProgrammedRoutinesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeProgram={activeProgram}
        todayRoutines={activeProgram.routines}
        onStartRoutine={handleStartRoutine}
        selectedDate={selectedDate}
        programType={activeProgram.type}
      />
    </>
  );
};

export default ProgrammedWorkoutButton;
