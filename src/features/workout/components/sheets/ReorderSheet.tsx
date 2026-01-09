import React, { useState } from "react";
import { Trash2, X, GripVertical } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { WorkoutExercise } from "../../types/workout";
import { Button } from "@/components/ui/button";

interface ReorderSheetProps {
  open: boolean;
  exercises: WorkoutExercise[];
  onOpenChange: (open: boolean) => void;
  onMoveExercise: (fromIndex: number, toIndex: number) => void;
  onRemoveExercise?: (index: number) => void;
  onSave: () => void;
}

const ReorderSheet: React.FC<ReorderSheetProps> = ({
  open,
  exercises,
  onOpenChange,
  onMoveExercise,
  onRemoveExercise,
  onSave
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    // Move exercise
    onMoveExercise(dragIndex, index);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="px-0 w-[90vw] sm:max-w-md bg-zinc-950 border-l border-white/5" hideCloseButton={true} side="right">
        <SheetHeader className="text-left px-4 flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/5 pt-4">
          <SheetTitle>Reordenar ejercicios</SheetTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-white transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </SheetHeader>
        <div className="py-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="space-y-2 px-4">
            {exercises.map((exercise, index) => (
              <div
                key={`reorder-${exercise.id}-${index}`}
                className={`flex items-center px-4 py-3 bg-secondary/10 border border-white/5 rounded-md cursor-move select-none ${dragIndex === index ? 'opacity-50 ring-2 ring-primary' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{ transition: 'all 0.15s ease-in-out' }}
              >
                <div className="mr-3 text-muted-foreground cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">{exercise.name}</h4>
                </div>
                {onRemoveExercise && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.preventDefault();
                      onRemoveExercise(index);
                    }}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        <SheetFooter className="px-4 border-t border-white/5 pt-4">
          <Button className="w-full" onClick={onSave} type="button">Guardar cambios</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ReorderSheet;
