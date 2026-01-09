import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Star, ClipboardCheck, Clock, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScheduledSurveyModalProps {
    survey: {
        id: string; // library_survey_id
        task_id: string; // user_scheduled_tasks id
        title: string;
        description?: string;
        is_completed?: boolean;
    };
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (taskId: string) => Promise<void>;
}

interface Question {
    id: string;
    question_text: string;
    question_type: 'single_choice' | 'multiple_choice' | 'short_text' | 'long_text' | 'rating' | 'yes_no';
    options: string[];
    is_required: boolean;
    order_index: number;
}

const ScheduledSurveyModal: React.FC<ScheduledSurveyModalProps> = ({ survey, isOpen, onClose, onComplete }) => {
    console.log("📊 ScheduledSurveyModal Render. isOpen:", isOpen, "Survey:", survey);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(survey.is_completed || false);

    useEffect(() => {
        if (isOpen) {
            if (survey.id) {
                console.log("🔄 Fetching questions for survey ID:", survey.id);
                fetchQuestions();
            } else {
                console.error("❌ Survey ID is missing", survey);
                setLoading(false);
                toast.error("Error: ID de encuesta no encontrado");
            }
        }
    }, [isOpen, survey.id]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('library_survey_questions')
                .select('*')
                .eq('survey_id', survey.id)
                .order('order_index', { ascending: true });

            console.log("📥 Questions response:", { data, error });

            if (error) throw error;
            setQuestions(data as Question[]);
        } catch (e) {
            console.error("❌ Error loading questions:", e);
            toast.error("Error al cargar las preguntas");
        } finally {
            setLoading(false);
        }
    };
    /* ... rest of code ... */

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    // ... existing helper functions ...

    const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
        const current = (answers[questionId] as string[]) || [];
        if (checked) {
            handleAnswerChange(questionId, [...current, option]);
        } else {
            handleAnswerChange(questionId, current.filter(o => o !== option));
        }
    };

    const handleSubmit = async () => {
        /* ... existing logic ... */
        try {
            setSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Validate required questions
            for (const q of questions) {
                if (q.is_required && !answers[q.id]) {
                    toast.error(`La pregunta "${q.question_text}" es obligatoria`);
                    setSubmitting(false);
                    return;
                }
            }

            const { error } = await supabase
                .from('library_survey_responses')
                .insert({
                    survey_id: survey.id,
                    user_id: user.id,
                    responses: answers
                });

            if (error) throw error;

            if (onComplete) {
                await onComplete(survey.task_id || "");
            }

            setCompleted(true);
            toast.success("Formulario enviado correctamente");

        } catch (e: any) {
            console.error("Survey submission error:", e);

            // Handle duplicate response error (409 Conflict / 23505 Unique Violation)
            if (e.code === '23505') {
                console.log("ℹ️ Survey already answered, proceeding to mark task as complete.");
                if (onComplete) {
                    await onComplete(survey.task_id || "");
                }
                setCompleted(true);
                toast.success("Encuesta ya completada anteriormente");
                return;
            }

            toast.error("Error al enviar el formulario");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl w-[95vw] bg-[#121212]/95 backdrop-blur-xl border-white/5 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col h-[85vh] [&>button.absolute]:hidden">
                {/* Header Area */}
                <div className="p-6 pb-4 flex items-start justify-between relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                <ClipboardCheck className="w-4 h-4 text-cyan-500" />
                            </div>
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white tracking-tight line-clamp-1">{survey.title}</DialogTitle>
                                <VisuallyHidden>
                                    <DialogDescription>
                                        Responde a las preguntas de la encuesta: {survey.title}
                                    </DialogDescription>
                                </VisuallyHidden>
                            </DialogHeader>
                            <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${completed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/10'}`}>
                                {completed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {completed ? "Completado" : "Pendiente"}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 pr-8">
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

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pt-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                            <p className="text-slate-400 text-sm">Cargando preguntas...</p>
                        </div>
                    ) : completed ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-in fade-in zoom-in">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h4 className="text-xl font-bold tracking-tight">¡Muchas gracias!</h4>
                            <p className="text-slate-400 text-center text-sm">Tus respuestas han sido enviadas correctamente.</p>
                            <Button variant="outline" onClick={onClose} className="mt-4 border-white/10 rounded-xl px-8">
                                Cerrar
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-10 pb-10">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className="flex gap-3">
                                        <span className="text-cyan-500 font-bold">{idx + 1}.</span>
                                        <Label className="text-lg font-semibold leading-snug">
                                            {q.question_text} {q.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </Label>
                                    </div>

                                    {q.question_type === 'short_text' && (
                                        <Input
                                            placeholder="Tu respuesta..."
                                            className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-cyan-500/50 transition-all"
                                            value={answers[q.id] || ""}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        />
                                    )}

                                    {q.question_type === 'long_text' && (
                                        <Textarea
                                            placeholder="Escribe aquí tu respuesta detallada..."
                                            className="bg-white/5 border-white/10 rounded-xl min-h-[120px] focus:border-cyan-500/50 transition-all font-sans"
                                            value={answers[q.id] || ""}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        />
                                    )}

                                    {q.question_type === 'single_choice' && (
                                        <RadioGroup
                                            value={answers[q.id]}
                                            onValueChange={(val) => handleAnswerChange(q.id, val)}
                                            className="grid grid-cols-1 gap-2"
                                        >
                                            {q.options.map((opt, i) => (
                                                <div key={i} className="flex items-center space-x-3 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                                    <RadioGroupItem value={opt} id={`q-${q.id}-${i}`} className="border-slate-700 text-cyan-500" />
                                                    <Label htmlFor={`q-${q.id}-${i}`} className="flex-1 cursor-pointer font-medium">{opt}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}

                                    {q.question_type === 'multiple_choice' && (
                                        <div className="grid grid-cols-1 gap-2">
                                            {q.options.map((opt, i) => {
                                                const isChecked = (answers[q.id] as string[] || []).includes(opt);
                                                return (
                                                    <div key={i} className="flex items-center space-x-3 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                                                        <Checkbox
                                                            id={`q-${q.id}-${i}`}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => handleCheckboxChange(q.id, opt, !!checked)}
                                                            className="border-slate-700 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                                                        />
                                                        <Label htmlFor={`q-${q.id}-${i}`} className="flex-1 cursor-pointer font-medium">{opt}</Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {q.question_type === 'yes_no' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Si', 'No'].map((opt) => (
                                                <Button
                                                    key={opt}
                                                    variant={answers[q.id] === opt ? "default" : "outline"}
                                                    className={`h-14 rounded-2xl text-base font-bold ${answers[q.id] === opt ? 'bg-cyan-600 hover:bg-cyan-700 border-0' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                                    onClick={() => handleAnswerChange(q.id, opt)}
                                                >
                                                    {opt}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    {q.question_type === 'rating' && (
                                        <div className="flex justify-center gap-4 py-4">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleAnswerChange(q.id, star)}
                                                    className="transition-transform active:scale-90"
                                                >
                                                    <Star
                                                        className={`w-10 h-10 ${answers[q.id] >= star ? 'fill-yellow-500 text-yellow-500' : 'text-slate-700'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!completed && !loading && (
                    <div className="p-6 border-t border-white/5 bg-white/5 shrink-0">
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition-all"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar Formulario"
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ScheduledSurveyModal;
