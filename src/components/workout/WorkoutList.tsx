
import React from "react";
import WorkoutListItem from "./WorkoutListItem";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutRoutine {
  id: number;
  name: string;
  type?: string;
  description?: string;
  exercise_count?: number;
  estimated_duration_minutes?: number;
  is_predefined?: boolean;
  source_type?: 'created' | 'downloaded' | 'gatofit_program';
  muscles?: string[];
}

interface WorkoutListProps {
  routines: WorkoutRoutine[];
  loading: boolean;
  onStartWorkout: (routineId: number) => void;
  onRoutineDeleted: () => void;
  onDeleteRoutine?: (routineId: number) => Promise<boolean>;
}

const WorkoutList: React.FC<WorkoutListProps> = ({
  routines,
  loading,
  onStartWorkout,
  onRoutineDeleted,
  onDeleteRoutine
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="neu-card p-4">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48 mb-2" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (routines.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-2xl">💪</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay rutinas</h3>
        <p className="text-muted-foreground mb-4">
          Crea tu primera rutina para empezar a entrenar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {routines.map((routine) => (
        <WorkoutListItem
          key={routine.id}
          routine={routine}
          onStartWorkout={onStartWorkout}
          onRoutineDeleted={onRoutineDeleted}
          onDeleteRoutine={onDeleteRoutine}
        />
      ))}
    </div>
  );
};

export default WorkoutList;
