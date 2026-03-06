import React, { useState, useEffect, useCallback } from "react";
import { fetchWithRetry } from "@/utils/network";
import { useToast } from "@/hooks/use-toast";
import WorkoutHeader from "@/components/workout/WorkoutHeader";
import WorkoutSearchFilter from "@/components/workout/WorkoutSearchFilter";
import WorkoutList from "@/components/workout/WorkoutList";
import FloatingActionMenu from "@/components/FloatingActionMenu";
import { useRoutinesWithLimits } from "@/hooks/useRoutinesWithLimits";
import { syncExercisesToDatabase } from "@/features/workout/services/exerciseSyncService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UsageLimitsBanner } from "@/components/premium/UsageLimitsBanner";
import { PremiumModal } from "@/components/premium/PremiumModal";
import DateSelector from "@/components/common/DateSelector";
import { useActiveProgramUnified } from "@/hooks/useActiveProgramUnified";
import WorkoutListItem from "@/components/workout/WorkoutListItem";



const WorkoutPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    routines,
    loading,
    refetch,
    showPremiumModal,
    setShowPremiumModal,
    getRoutineUsageInfo,
    deleteRoutine,
    isPremium,
    isAsesorado
  } = useRoutinesWithLimits();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{ types: string[], muscles: string[] }>({
    types: [],
    muscles: []
  });
  const [usageInfo, setUsageInfo] = useState({ current: 0, limit: 3, canCreate: true, isOverLimit: false });

  // Función memoizada para cargar info de uso
  const loadUsageInfo = useCallback(async () => {
    if (!isPremium) {
      const info = await getRoutineUsageInfo();
      setUsageInfo(info);
    }
  }, [isPremium, getRoutineUsageInfo]);

  // Inicializar ejercicios preventivamente sin bloquear UI
  useEffect(() => {
    const ac = new AbortController();
    const initialize = async () => {
      try {
        await syncExercisesToDatabase();
        console.log("Exercise synchronization completed in background");
      } catch (error: any) {
        console.error("Error syncing exercises:", error);
      }
    };
    initialize();
    return () => {
      ac.abort();
    };
  }, []);

  // Cargar info de uso solo al montar el componente
  useEffect(() => {
    loadUsageInfo();
  }, [loadUsageInfo]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { activeProgram, loading: programLoading } = useActiveProgramUnified(selectedDate);

  // Update selectedDate when "Today" button in DateSelector is clicked (implied by logic)

  // Filter routines based on search term and filters
  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.types.length === 0 ||
      (routine.type && filters.types.includes(routine.type));
    const matchesMuscle = filters.muscles.length === 0 ||
      (routine.muscles && routine.muscles.some((muscle: string) =>
        filters.muscles.includes(muscle)
      ));

    return matchesSearch && matchesType && matchesMuscle;
  });

  const handleStartWorkout = (routineId: number) => {
    navigate(`/workout/active/${routineId}`);
  };

  const handleCreateRoutine = async () => {
    if (!isPremium) {
      await loadUsageInfo();

      if (!usageInfo.canCreate) {
        setShowPremiumModal(true);
        return;
      }
    }

    navigate("/workout/create");
  };

  const handleCreateProgram = () => {
    navigate("/workout/programs");
  };

  const handleOpenGatofitPrograms = () => {
    navigate("/gatofit-programs");
  };

  const handleRoutineDeleted = async () => {
    await refetch();
    if (!isPremium) {
      await loadUsageInfo();
    }
  };

  const handleFiltersChange = (newFilters: { types: string[], muscles: string[] }) => {
    setFilters(newFilters);
    console.log("Filters applied:", newFilters);
  };

  // Scheduled Routine Logic
  const scheduledRoutines = activeProgram?.routines || [];
  const scheduledRoutine = scheduledRoutines.length > 0 ? scheduledRoutines[0].routine : null;

  return (
    <div className="min-h-screen pb-24 px-4 max-w-md mx-auto" style={{ paddingTop: 'calc(max(var(--safe-area-inset-top), 50px) + 1.5rem)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Mis Rutinas</h1>
          {!isPremium && (
            <UsageLimitsBanner type="routines" />
          )}
        </div>
      </div>

      <WorkoutSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFiltersChange={handleFiltersChange}
        activeFilters={filters}
      />

      {/* Scheduled Routine Display */}
      <div className="mb-6 space-y-4">
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {programLoading ? (
          <div className="border-2 border-border/50 rounded-xl overflow-hidden shadow-sm h-[130px] w-full bg-card animate-pulse p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2 w-2/3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted/60 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-8 bg-muted rounded-full"></div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="h-6 w-16 bg-muted rounded-full"></div>
              <div className="h-6 w-16 bg-muted rounded-full"></div>
            </div>
          </div>
        ) : scheduledRoutines.length > 0 ? (
          <div className="space-y-4">
            {scheduledRoutines.map((routineData: any, index: number) => {
              const routine = routineData.routine;
              if (!routine) return null;

              return (
                <div key={`${routine.id}-${index}`} className="border-2 border-primary rounded-xl overflow-hidden shadow-md shadow-primary/10 relative">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg font-medium z-10">
                    Programado
                  </div>
                  <WorkoutListItem
                    routine={{
                      ...routine,
                      source_type: undefined // Hide source tags
                    }}
                    onStartWorkout={() => handleStartWorkout(routine.id)}
                    onRoutineDeleted={() => { }}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Workout loading handled recursively through React Query */}
      <WorkoutList
        routines={filteredRoutines}
        loading={loading}
        onStartWorkout={handleStartWorkout}
        onRoutineDeleted={handleRoutineDeleted}
        onDeleteRoutine={deleteRoutine}
      />

      <FloatingActionMenu
        onCreateRoutine={handleCreateRoutine}
        onCreateProgram={handleCreateProgram}
        onOpenGatofitPrograms={handleOpenGatofitPrograms}
        isAsesorado={isAsesorado}
        isPremium={isPremium}
      />

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="routines"
      />
    </div>
  );
};

export default WorkoutPage;
