import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ExerciseNotesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notes: string) => void;
    initialNotes: string;
    exerciseName: string;
}

export const ExerciseNotesDialog: React.FC<ExerciseNotesDialogProps> = ({
    isOpen,
    onClose,
    onSave,
    initialNotes,
    exerciseName,
}) => {
    const [notes, setNotes] = useState(initialNotes);

    useEffect(() => {
        if (isOpen) {
            setNotes(initialNotes);
        }
    }, [isOpen, initialNotes]);

    const handleSave = () => {
        onSave(notes);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md w-[90vw] rounded-xl">
                <DialogHeader>
                    <DialogTitle>Notas para {exerciseName}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <label className="text-sm text-zinc-400 mb-2 block">
                        Instrucciones o notas para este ejercicio:
                    </label>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej: Mantener la espalda recta..."
                        className="min-h-[120px] bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-sky-500 focus:ring-0 resize-none"
                    />
                </div>

                <DialogFooter className="flex-row gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 sm:flex-none border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-700 text-white font-medium"
                    >
                        Guardar Nota
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
