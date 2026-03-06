
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Flame, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutDetail {
  exercise_id: number;
  exercise_name: string;
  sets: Array<{
    set_number: number;
    weight: number | null;
    reps: number | null;
    rir: number | null;
    partial_reps: number | null;
    notes: string | null;
  }>;
}

interface WorkoutSummary {
  id: number;
  name: string;
  date: string;
  duration: number;
  calories: number;
  exercises: WorkoutDetail[];
}

const WorkoutSummaryPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workout, setWorkout] = useState<WorkoutSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutSummary = async () => {
      if (!workoutId) return;

      try {
        // Fetch workout log
        const { data: workoutLog, error: workoutError } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('id', parseInt(workoutId))
          .single();

        if (workoutError) throw workoutError;
        if (!workoutLog) throw new Error("Workout not found");

        // Fetch workout exercise details
        const { data: exerciseDetails, error: detailsError } = await supabase
          .from('workout_log_exercise_details')
          .select('*')
          .eq('workout_log_id', parseInt(workoutId))
          .order('exercise_name_snapshot', { ascending: true })
          .order('set_number', { ascending: true });

        if (detailsError) throw detailsError;

        // Group exercise details by exercise
        const exerciseMap = new Map<string, WorkoutDetail>();

        exerciseDetails.forEach((detail) => {
          const exerciseName = detail.exercise_name_snapshot;

          if (!exerciseMap.has(exerciseName)) {
            exerciseMap.set(exerciseName, {
              exercise_id: detail.exercise_id,
              exercise_name: exerciseName,
              sets: []
            });
          }

          exerciseMap.get(exerciseName)?.sets.push({
            set_number: detail.set_number,
            weight: detail.weight_kg_used,
            reps: detail.reps_completed,
            rir: (detail as any).rir ?? null,
            partial_reps: (detail as any).partial_reps ?? null,
            notes: detail.notes
          });
        });

        // Format workout summary
        setWorkout({
          id: workoutLog.id,
          name: workoutLog.routine_name_snapshot || "Entrenamiento",
          date: workoutLog.workout_date,
          duration: workoutLog.duration_completed_minutes || 0,
          calories: workoutLog.calories_burned_estimated || 0,
          exercises: Array.from(exerciseMap.values())
        });
      } catch (error) {
        console.error("Error fetching workout summary:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar el resumen del entrenamiento",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutSummary();
  }, [workoutId, toast]);

  const handleBack = () => {
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Entrenamiento no encontrado</h1>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            El entrenamiento que estás buscando no existe o ha sido eliminado.
          </p>
          <Button onClick={handleBack}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={handleBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold">Resumen de entrenamiento</h1>
      </div>

      {/* Workout Info Card */}
      <Card className="bg-secondary/40 border border-white/5 p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">{workout.name}</h2>

        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{formatDate(workout.date)}</span>
          </div>

          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{workout.duration} min</span>
          </div>

          <div className="flex items-center">
            <Flame className="h-4 w-4 mr-1 text-primary" />
            <span>{workout.calories} kcal</span>
          </div>
        </div>
      </Card>

      {/* Exercise Details */}
      <h3 className="text-base font-medium mb-3">Ejercicios realizados</h3>

      <div className="space-y-4 mb-6">
        {workout.exercises.map((exercise, index) => (
          <Card key={index} className="bg-secondary/40 border border-white/5 overflow-hidden">
            <div className="p-4">
              <h4 className="font-medium mb-3">{exercise.exercise_name}</h4>

              <div className="space-y-3">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="bg-background/30 border border-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-sm mr-2">
                          {set.set_number}
                        </div>
                        <span className="text-sm">Serie {set.set_number}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Peso</span>
                        <p className="font-medium">{set.weight !== null ? `${set.weight} kg` : '-'}</p>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">Repeticiones</span>
                        <p className="font-medium">
                          {set.reps !== null ? set.reps : '-'}
                          {set.partial_reps !== null && set.partial_reps > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">+{set.partial_reps}p</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* RIR badge */}
                    {set.rir !== null && set.rir !== undefined && (
                      <div className="mt-2">
                        <span className="inline-flex items-center text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                          {set.rir} RIR
                        </span>
                      </div>
                    )}

                    {set.notes && (
                      <div className="mt-2 text-xs">
                        <span className="text-xs text-muted-foreground">Notas</span>
                        <p className="italic">{set.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
        >
          Volver al inicio
        </Button>

        <Button
          variant="default"
          onClick={() => navigate('/workout')}
        >
          Otro entrenamiento
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default WorkoutSummaryPage;
