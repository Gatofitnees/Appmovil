
import React, { useState, useEffect } from "react";
import { Edit, MoreVertical, PlayCircle, Trash, Share2, EyeOff, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/Card";
import { useToast } from "@/hooks/use-toast";
import { useSharedRoutines } from "@/hooks/useSharedRoutines";
import { useQueryClient } from "@tanstack/react-query";
import { fetchRoutineDetailsById } from "@/features/workout/hooks/useRoutineDetail";

interface WorkoutListItemProps {
  routine: {
    id: number;
    name: string;
    type?: string;
    description?: string;
    exercise_count?: number;
    estimated_duration_minutes?: number;
    is_predefined?: boolean;
    source_type?: 'created' | 'downloaded' | 'gatofit_program';
  };
  onStartWorkout: (routineId: number) => void;
  onRoutineDeleted: () => void;
  onDeleteRoutine?: (routineId: number) => Promise<boolean>;
}

const WorkoutListItem: React.FC<WorkoutListItemProps> = ({
  routine,
  onStartWorkout,
  onRoutineDeleted,
  onDeleteRoutine
}) => {
  const { toast } = useToast();
  const { publishRoutine, unpublishRoutine, checkIfPublished, isPublishing } = useSharedRoutines();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const queryClient = useQueryClient();

  // Check if routine is published on mount
  useEffect(() => {
    const checkStatus = async () => {
      const published = await checkIfPublished(routine.id);
      setIsPublished(published);
    };
    checkStatus();
  }, [routine.id, checkIfPublished]);

  // Determina los textos a mostrar según el tipo de rutina
  const typeLabel = routine.type
    ? routine.type.charAt(0).toUpperCase() + routine.type.slice(1)
    : "General";

  const exerciseLabel = routine.exercise_count === 1
    ? "1 ejercicio"
    : `${routine.exercise_count} ejercicios`;

  const timeLabel = routine.estimated_duration_minutes
    ? `${routine.estimated_duration_minutes} min`
    : "15-30 min";

  const isDownloaded = routine.source_type === 'downloaded';
  const isFromGatofitProgram = routine.source_type === 'gatofit_program';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      let success = false;
      if (onDeleteRoutine) {
        // Usar el método del hook que maneja créditos
        success = await onDeleteRoutine(routine.id);
      } else {
        // Fallback al método anterior
        const { supabase } = await import("@/integrations/supabase/client");
        const { error: routineError } = await supabase
          .from('routines')
          .delete()
          .eq('id', routine.id);

        if (routineError) {
          console.error("Error deleting routine:", routineError);
          throw routineError;
        }
        success = true;
      }

      if (success) {
        toast({
          title: "Rutina eliminada",
          description: "La rutina ha sido eliminada correctamente",
        });
        onRoutineDeleted();
      }
    } catch (error: any) {
      console.error("Error deleting routine:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la rutina. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditRoutine = () => {
    window.location.href = `/workout/edit/${routine.id}`;
  };

  const handlePublishToggle = async () => {
    if (isPublished) {
      await unpublishRoutine(routine.id);
      setIsPublished(false);
    } else {
      await publishRoutine(routine.id);
      setIsPublished(true);
    }
  };

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['routine', routine.id],
      queryFn: () => fetchRoutineDetailsById(routine.id),
      staleTime: 1000 * 60 * 5,
    });
  };

  // Use a wrapper div with the onClick handler instead of putting it directly on the Card
  return (
    <div
      onClick={() => onStartWorkout(routine.id)}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-shadow border-none">
        <div className="p-4">
          {/* Título y Menú */}
          <div className="flex justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">
                {routine.name}
              </h3>
              {isDownloaded && (
                <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded border border-blue-200 flex-shrink-0">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
              )}
              {isFromGatofitProgram && (
                <div className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded border border-purple-200 flex-shrink-0">
                  <span className="text-purple-600 text-xs font-bold">G</span>
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-1 rounded-full hover:bg-secondary/30 flex-shrink-0">
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border border-secondary">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditRoutine();
                  }}
                  disabled={routine.is_predefined || isDeleting || isDownloaded || isFromGatofitProgram}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePublishToggle();
                  }}
                  disabled={routine.is_predefined || isPublishing || isDownloaded || isFromGatofitProgram}
                  className="cursor-pointer"
                >
                  {isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Despublicar
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Publicar rutina
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={routine.is_predefined || isDeleting || isFromGatofitProgram}
                  className="text-destructive cursor-pointer focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Detalles */}
          <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <span>{typeLabel} • {exerciseLabel}</span>
            {isPublished && (
              <Badge variant="default">
                Publicada
              </Badge>
            )}
            {isDownloaded && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Comunidad
              </span>
            )}
            {isFromGatofitProgram && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                Gatofit
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Duración: {timeLabel}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartWorkout(routine.id);
              }}
              className="flex items-center justify-center gap-1 text-sm font-medium text-primary"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Empezar</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkoutListItem;
