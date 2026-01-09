
import React, { useEffect, useRef, useCallback } from "react";
import ExerciseItem from "./ExerciseItem";
import Button from "@/components/Button";
import { Loader2 } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  difficulty_level?: string;
  video_url?: string;
  image_url?: string;
  thumbnail_url?: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  selectedExercises: number[];
  onSelectExercise: (id: number) => void;
  onViewDetails: (id: number) => void;
  loading: boolean;
  previouslySelectedIds?: number[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  selectedExercises, 
  onSelectExercise,
  onViewDetails,
  loading,
  previouslySelectedIds = [],
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}) => {
  if (loading && exercises.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {exercises && exercises.length > 0 ? (
        <>
          {exercises.map(exercise => {
            // Check if this exercise is already in the routine
            const isAlreadySelected = previouslySelectedIds.includes(exercise.id);
            
            return (
              <ExerciseItem 
                key={exercise.id}
                exercise={exercise}
                isSelected={selectedExercises.includes(exercise.id)}
                onSelect={onSelectExercise}
                onViewDetails={onViewDetails}
                isAlreadyInRoutine={isAlreadySelected}
              />
            );
          })}

          {/* Infinite scroll trigger */}
          {hasNextPage && <InfiniteScrollTrigger onVisible={fetchNextPage} isLoading={isFetchingNextPage} />}
        </>
      ) : !loading ? (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron ejercicios
        </div>
      ) : null}
    </div>
  );
};

// Invisible trigger component for infinite scroll
interface InfiniteScrollTriggerProps {
  onVisible: () => void;
  isLoading: boolean;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({ onVisible, isLoading }) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          onVisible();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [onVisible, isLoading]);

  return (
    <div ref={observerTarget} className="flex justify-center py-6">
      {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
    </div>
  );
};

export default ExerciseList;
