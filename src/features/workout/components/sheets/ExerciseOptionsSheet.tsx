
import React from "react";
import { Grip, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ExerciseOptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReorderClick: () => void;
  onReplaceExercise: () => void;
  onRemoveExercise: () => void;
}

const ExerciseOptionsSheet: React.FC<ExerciseOptionsSheetProps> = ({
  open,
  onOpenChange,
  onReorderClick,
  onReplaceExercise,
  onRemoveExercise
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 bg-zinc-950 border-t border-white/10">
        <SheetHeader className="text-left px-5 py-4 border-b border-white/5">
          <SheetTitle className="text-lg font-semibold">Opciones de ejercicio</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col py-1">
          <button
            className="flex items-center w-full px-5 py-4 text-left hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/5"
            onClick={(e) => {
              e.preventDefault();
              onReorderClick();
            }}
            type="button"
          >
            <Grip className="mr-3 h-5 w-5 text-white" />
            <span className="text-base font-medium text-white">Reordenar</span>
          </button>

          <button
            className="flex items-center w-full px-5 py-4 text-left hover:bg-white/5 active:bg-white/10 transition-colors border-b border-white/5"
            onClick={(e) => {
              e.preventDefault();
              onReplaceExercise();
            }}
            type="button"
          >
            <Plus className="mr-3 h-5 w-5 text-white" />
            <span className="text-base font-medium text-white">Reemplazar ejercicio</span>
          </button>

          <button
            className="flex items-center w-full px-5 py-4 text-left hover:bg-red-500/10 active:bg-red-500/20 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onRemoveExercise();
            }}
            type="button"
          >
            <Trash2 className="mr-3 h-5 w-5 text-red-500" />
            <span className="text-base font-medium text-red-500">Eliminar ejercicio</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExerciseOptionsSheet;
