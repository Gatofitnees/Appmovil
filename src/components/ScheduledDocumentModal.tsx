import React from "react";
import { X, FileText, Download, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ScheduledDocumentModalProps {
    document: {
        id?: string;
        task_id?: string;
        title: string;
        description?: string;
        file_url: string;
        file_name?: string;
        is_completed?: boolean;
    };
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (taskId: string) => Promise<void>;
}

const ScheduledDocumentModal: React.FC<ScheduledDocumentModalProps> = ({ document, isOpen, onClose, onComplete }) => {
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(document.file_url);
    const isPdf = /\.pdf$/i.test(document.file_url);
    const pdfUrl = React.useMemo(() => `${document.file_url}#toolbar=0&navpanes=0&scrollbar=1`, [document.file_url]);
    const [submitting, setSubmitting] = React.useState(false);

    const handleComplete = async () => {
        if (!onComplete) return;
        try {
            setSubmitting(true);
            await onComplete(document.task_id || "");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-[95vw] h-[85vh] bg-[#121212]/95 backdrop-blur-xl border-white/5 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col [&>button.absolute]:hidden">
                {/* Header Area */}
                <div className="p-6 pb-4 flex items-start justify-between relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                                <FileText className="w-4 h-4 text-amber-500" />
                            </div>
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white tracking-tight line-clamp-1">{document.title}</DialogTitle>
                            </DialogHeader>
                            <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${document.is_completed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'}`}>
                                {document.is_completed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {document.is_completed ? "Leído" : "Pendiente"}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pr-8">
                        {/* Download button removed as requested */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-white/5 rounded-full text-slate-400"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative flex flex-col px-6 pb-6 gap-6">
                    {/* Content Area */}
                    <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 overflow-hidden relative flex items-center justify-center">
                        {isImage ? (
                            <img
                                src={document.file_url}
                                alt={document.title}
                                className="max-w-full max-h-full object-contain p-4 transition-all duration-500"
                            />
                        ) : isPdf ? (
                            <div className="w-full h-full bg-white text-black">
                                <object
                                    data={pdfUrl}
                                    type="application/pdf"
                                    className="w-full h-full"
                                    aria-label={document.title}
                                >
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full h-full border-0"
                                        title={document.title}
                                    />
                                    <div className="p-6 text-center space-y-3">
                                        <p className="font-semibold text-black">No se pudo cargar la vista previa.</p>
                                        <p className="text-sm text-slate-600">Abre el documento en una nueva pestaña.</p>
                                        <Button
                                            onClick={() => window.open(document.file_url, '_blank', 'noopener,noreferrer')}
                                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                                        >
                                            Abrir documento
                                        </Button>
                                    </div>
                                </object>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 p-8 text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                    <FileText className="w-8 h-8 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white tracking-tight">Vista previa no disponible</p>
                                    <p className="text-sm text-slate-500 mt-2">Este archivo debe descargarse para ser visualizado.</p>
                                </div>
                                <Button
                                    onClick={() => window.open(document.file_url, '_blank')}
                                    className="bg-amber-600 hover:bg-amber-700 rounded-2xl h-12 px-8 font-bold text-white transition-all active:scale-95"
                                >
                                    Descargar Documento
                                </Button>
                            </div>
                        )}
                    </div>

                    {!document.is_completed && (
                        <Button
                            onClick={handleComplete}
                            disabled={submitting}
                            className="bg-amber-600 hover:bg-amber-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all shrink-0"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Confirmar Lectura"
                            )}
                        </Button>
                    )}

                    {document.description && (
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shrink-0">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Descripción</h4>
                            <p className="text-slate-400 text-sm leading-relaxed antialiased">{document.description}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ScheduledDocumentModal;
