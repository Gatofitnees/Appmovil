import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RIRInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RIRInfoModal: React.FC<RIRInfoModalProps> = ({ isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-background border border-white/10 p-6 pt-8 rounded-2xl w-[90vw] max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 mb-2">
                        ¿Qué es el RIR?
                    </DialogTitle>
                    <DialogDescription className="text-base text-foreground/90 space-y-4 pt-2">
                        <p>
                            El <strong>RIR</strong> (Repeticiones en Reserva) indica cuántas repeticiones más sentías que podías hacer antes de llegar al fallo muscular en una serie.
                        </p>

                        <ul className="space-y-3 text-sm mt-4">
                            <li className="flex gap-3 items-start">
                                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs">0</span>
                                <span><strong>Fallo Muscular:</strong> No podías hacer ni una repetición más. Has dado el 100%.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-red-500 text-white font-bold text-xs">1</span>
                                <span><strong>1 en reserva:</strong> Podías haber hecho exactamente 1 repetición más. Muy intenso.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-xs">2</span>
                                <span><strong>2 en reserva:</strong> Podías hacer 2 más. Intensidad alta, ideal para hipertrofia.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-yellow-500 text-white font-bold text-xs">3</span>
                                <span><strong>3 en reserva:</strong> Podías hacer 3 más. Intensidad moderada/alta.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-green-500 text-white font-bold text-xs">4-5</span>
                                <span><strong>4 a 5 en reserva:</strong> Intensidad moderada. Series de aproximación pesadas.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs">6+</span>
                                <span><strong>6 o más:</strong> Intensidad baja. Calentamiento suave.</span>
                            </li>
                        </ul>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end mt-4">
                    <Button onClick={onClose} className="w-full">Entendido</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
