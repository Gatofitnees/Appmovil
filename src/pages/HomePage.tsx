
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useHomePageData } from "@/hooks/useHomePageData";
import { fetchWithRetry } from "@/utils/network";
import { useProfileContext } from "@/contexts/ProfileContext";
import UserHeader from "../components/UserHeader";
import DaySelector from "../components/DaySelector";
import TrainingCard from "../components/TrainingCard";
import MacrosCard from "../components/MacrosCard";
import AssignedLibraryItems from "../components/home/AssignedLibraryItems";
import FloatingActionButton from "../components/FloatingActionButton";
import { usePlatform } from "@/hooks/usePlatform";



const HomePage: React.FC = () => {
  const { isIOS, isAndroid } = usePlatform();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshProfile } = useProfileContext();

  const {
    selectedDate,
    hasCompletedWorkout,
    workoutSummaries,
    loading,
    datesWithWorkouts,
    macros,
    handleDateSelect,
    refetch
  } = useHomePageData();

  // Profile and home data are already fetched by their respective hooks on mount.
  // We don't need to force a refresh here as it creates redundant network requests.

  const handleStartWorkout = (routineId?: number) => {
    if (routineId) {
      // Si se proporciona un routineId, iniciar esa rutina específica
      navigate(`/workout/active/${routineId}`);
    } else {
      // Si no, ir a la página de selección de rutinas
      navigate("/workout");
    }
  };

  const handleViewWorkoutDetails = (workoutId?: number) => {
    if (workoutId) {
      navigate(`/workout/summary/${workoutId}`);
    } else {
      toast({
        title: "Detalles del entrenamiento",
        description: "No se pudo encontrar el entrenamiento.",
      });
    }
  };

  const handleAddFood = () => {
    toast({
      title: "Añadir comida",
      description: "Redirigiendo a la página de nutrición...",
    });
    navigate("/nutrition");
  };

  return (
    <div
      className="min-h-screen px-4 max-w-md mx-auto"
      style={{
        paddingTop: (isIOS || isAndroid)
          ? 'calc(max(var(--safe-area-inset-top), 50px) + 1rem)'
          : 'calc(max(var(--safe-area-inset-top), 50px) + 1rem)',
        paddingBottom: 'max(6rem, calc(var(--safe-area-inset-bottom) + 6rem))',
        background: 'transparent'
      }}
    >
      <div className="mb-4">
        <UserHeader />
      </div>
      <DaySelector
        onSelectDate={handleDateSelect}
        datesWithRecords={datesWithWorkouts}
      />
      <TrainingCard
        loading={loading}
        completed={hasCompletedWorkout}
        workouts={workoutSummaries}
        onStartWorkout={handleStartWorkout}
        onViewDetails={handleViewWorkoutDetails}
        showProgramModal={true}
        selectedDate={selectedDate}
      />
      <MacrosCard macros={macros} onAddFood={handleAddFood} />
      <AssignedLibraryItems />
    </div>
  );
};

export default HomePage;
