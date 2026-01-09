
import { useSelectionStorage } from "./exercise-selection/useSelectionStorage";
import { useExerciseNavigation } from "./exercise-selection/useExerciseNavigation";
import { usePaginatedExercises } from "./usePaginatedExercises";
import { useExerciseFilterOptions } from "./useExerciseFilterOptions";
import { useDebounce } from "@/hooks/useDebounce";

export const useExerciseSelection = () => {
  const { muscleGroups, equipmentTypes } = useExerciseFilterOptions();

  const {
    searchTerm,
    setSearchTerm,
    selectedExercises,
    setSelectedExercises,
    muscleFilters,
    setMuscleFilters,
    equipmentFilters,
    setEquipmentFilters,
    previouslySelectedIds,
    setPreviouslySelectedIds,
    resetSessionStorage
  } = useSelectionStorage();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
  } = usePaginatedExercises({ searchTerm: debouncedSearchTerm, muscleFilters, equipmentFilters });

  const filteredExercises = data?.pages.flatMap(page => page.data) ?? [];
  const totalExerciseCount = data?.pages[0]?.totalCount ?? 0;

  const {
    handleExerciseDetails,
    handleNavigateBack: baseHandleNavigateBack,
    handleCreateExercise,
    handleAddExercises: baseHandleAddExercises
  } = useExerciseNavigation();

  const handleExerciseSelect = (id: number) => {
    setSelectedExercises(prev =>
      prev.includes(id) ? prev.filter(exId => exId !== id) : [...prev, id]
    );
  };

  const handleMuscleFilterToggle = (muscle: string) => {
    setMuscleFilters(prev =>
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  const handleEquipmentFilterToggle = (equipment: string) => {
    setEquipmentFilters(prev =>
      prev.includes(equipment) ? prev.filter(e => e !== equipment) : [...prev, equipment]
    );
  };

  const handleClearFilters = () => {
    setMuscleFilters([]);
    setEquipmentFilters([]);
  };

  const handleNavigateBack = () => {
    baseHandleNavigateBack(resetSessionStorage);
  };

  const handleAddExercises = () => {
    const allFetchedExercises = data?.pages.flatMap(page => page.data) ?? [];
    baseHandleAddExercises(selectedExercises, allFetchedExercises, resetSessionStorage);
  };

  return {
    filteredExercises,
    exerciseCount: totalExerciseCount,
    selectedExercises,
    muscleGroups,
    equipmentTypes,
    muscleFilters,
    equipmentFilters,
    searchTerm,
    loading,
    previouslySelectedIds,
    setSearchTerm,
    setPreviouslySelectedIds,
    handleExerciseSelect,
    handleMuscleFilterToggle,
    handleEquipmentFilterToggle,
    handleExerciseDetails,
    handleNavigateBack,
    handleCreateExercise,
    handleAddExercises,
    handleClearFilters,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};
