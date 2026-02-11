import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, ArrowLeft, Check, Dumbbell, ChevronRight, Play } from 'lucide-react';
import { RoutineExercise } from '@/features/workout/types';
import { useAIRoutineGenerator } from '../hooks/useAIRoutineGenerator';
import Button from '@/components/Button';
import { useCoachBranding } from '@/hooks/useCoachBranding';
import { clearAIChatMemory } from '../services/aiChatMemoryService';

const MUSCLE_GROUPS = [
    {
        id: 'chest', label: 'Pecho',
        subOptions: [
            { id: 'chest_general', label: 'General' },
            { id: 'chest_upper', label: 'Pectoral Superior' },
            { id: 'chest_lower', label: 'Pectoral Inferior' }
        ]
    },
    {
        id: 'back', label: 'Espalda',
        subOptions: [
            { id: 'back_general', label: 'General' },
            { id: 'lats', label: 'Dorsales' },
            { id: 'upper_back', label: 'Espalda Alta' },
            { id: 'lower_back', label: 'Lumbares' }
        ]
    },
    {
        id: 'legs', label: 'Pierna',
        subOptions: [
            { id: 'legs_general', label: 'General' },
            { id: 'quads', label: 'Cuádriceps' },
            { id: 'hamstrings', label: 'Isquiotibiales' },
            { id: 'glutes', label: 'Glúteos' },
            { id: 'calves', label: 'Pantorrillas' }
        ]
    },
    {
        id: 'shoulders', label: 'Hombro',
        subOptions: [
            { id: 'shoulders_general', label: 'General' },
            { id: 'delts_front', label: 'Anterior' },
            { id: 'delts_side', label: 'Lateral' },
            { id: 'delts_rear', label: 'Posterior' }
        ]
    },
    {
        id: 'arms', label: 'Brazos',
        subOptions: [
            { id: 'biceps', label: 'Bíceps' },
            { id: 'triceps', label: 'Tríceps' },
            { id: 'forearms', label: 'Antebrazos' }
        ]
    },
    {
        id: 'abs', label: 'Abdomen',
        subOptions: [
            { id: 'abs_rectus', label: 'Recto Abdominal' },
            { id: 'obliques', label: 'Oblicuos' }
        ]
    },
    {
        id: 'full_body', label: 'Cuerpo Completo', subOptions: []
    }
];

interface AICreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoutineGenerated: (exercises: RoutineExercise[], routineName: string, description: string) => void;
}

const AICreationModal: React.FC<AICreationModalProps> = ({ isOpen, onClose, onRoutineGenerated }) => {
    // State
    const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: React.ReactNode; routineData?: any }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [mode, setMode] = useState<'onboarding' | 'chat'>('onboarding');
    const [onboardingStep, setOnboardingStep] = useState(0);
    const [expandedMuscle, setExpandedMuscle] = useState<string | null>(null);
    const [selectedExerciseDetails, setSelectedExerciseDetails] = useState<RoutineExercise | null>(null);

    // Initial Recommendation Data
    const [lastGeneratedRoutine, setLastGeneratedRoutine] = useState<{
        exercises: RoutineExercise[],
        name: string,
        description: string
    } | null>(null);

    // Hook Integration
    const { generateRoutine } = useAIRoutineGenerator();
    const { branding } = useCoachBranding();

    // Determine Theme Colors from Branding or Defaults
    const primaryColor = branding.primaryButtonFillColor || '#6366f1';

    // User Preferences State
    const [preferences, setPreferences] = useState({
        type: '',
        goal: '',
        experience: '',
        focus_muscles: [] as string[]
    });

    // Onboarding Configuration
    const onboardingSteps = [
        {
            id: 'type',
            question: "¿Dónde vas a entrenar?",
            multiSelect: false,
            options: [
                { id: 'gym', label: 'Gimnasio Completo' },
                { id: 'home_dumbbells', label: 'Casa (Mancuernas)' },
                { id: 'home_bodyweight', label: 'Casa (Sin equipo)' },
                { id: 'calisthenics', label: 'Parque / Calistenia' }
            ]
        },
        {
            id: 'goal',
            question: "¿Cuál es tu objetivo principal?",
            multiSelect: false,
            options: [
                { id: 'muscle', label: 'Ganar Músculo' },
                { id: 'fat_loss', label: 'Perder Grasa' },
                { id: 'strength', label: 'Ganar Fuerza' },
                { id: 'endurance', label: 'Resistencia' }
            ]
        },
        {
            id: 'focus_muscles',
            question: "¿En qué músculos quieres enfocarte?",
            multiSelect: true,
            options: [
                { id: 'chest', label: 'Pecho' },
                { id: 'back', label: 'Espalda' },
                { id: 'legs', label: 'Pierna' },
                { id: 'shoulders', label: 'Hombro' },
                { id: 'arms', label: 'Brazos' },
                { id: 'abs', label: 'Abdomen' },
                { id: 'full_body', label: 'Cuerpo Completo' }
            ]
        },
        {
            id: 'experience',
            question: "¿Tu nivel de experiencia?",
            multiSelect: false,
            options: [
                { id: 'beginner', label: 'Principiante' },
                { id: 'intermediate', label: 'Intermedio' },
                { id: 'advanced', label: 'Avanzado' }
            ]
        }
    ];

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const modalVariants = {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { y: '100%', opacity: 0 }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    useEffect(() => {
        if (isOpen) {
            setMessages([]);
            setMode('onboarding');
            setOnboardingStep(0);
            setPreferences({ type: '', goal: '', experience: '', focus_muscles: [] });
            setLastGeneratedRoutine(null);
            setIsThinking(false);
        }
    }, [isOpen]);

    const handleBack = async () => {
        if (mode === 'chat') {
            // Optional back logic
        } else if (onboardingStep > 0) {
            setOnboardingStep(prev => prev - 1);
        } else {
            // Clear chat memory when closing modal from onboarding
            await clearAIChatMemory();
            onClose();
        }
    };

    const handleCloseModal = async () => {
        // Clear chat memory when closing modal via X button
        await clearAIChatMemory();
        onClose();
    };

    const handleOptionSelect = (key: string, value: string) => {
        const step = onboardingSteps[onboardingStep];

        if (step.multiSelect) {
            setPreferences(prev => {
                const current = prev[key as keyof typeof prev] as string[];
                return current.includes(value)
                    ? { ...prev, [key]: current.filter(v => v !== value) }
                    : { ...prev, [key]: [...current, value] };
            });
        } else {
            setPreferences({ ...preferences, [key]: value });
        }
    };

    const handleNextStep = () => {
        if (onboardingStep < onboardingSteps.length - 1) {
            setOnboardingStep(prev => prev + 1);
        } else {
            startGeneration();
        }
    };

    const startGeneration = async () => {
        setMode('chat');
        setIsThinking(true);

        const chatContext = `Genera una rutina inicial para: lugar/equipo ${preferences.type}, objetivo ${preferences.goal}, nivel ${preferences.experience}, enfoque en [${preferences.focus_muscles.join(', ')}].`;

        try {
            const result = await generateRoutine({
                ...preferences,
                chatContext,
                days: '4'
            });

            if (result) {
                setLastGeneratedRoutine(result);
                setMessages([
                    {
                        id: 'sys_init_response',
                        role: 'assistant',
                        content: `¡Listo! He diseñado una rutina de **${result.name}** basada en tu perfil.\n\n${result.description}`,
                        routineData: result
                    }
                ]);
            } else {
                setMessages([{ id: 'err', role: 'assistant', content: 'Tuve un problema conectando con la base de datos de ejercicios. ¿Intentamos de nuevo?' }]);
            }
        } catch (e) {
            setMessages([{ id: 'err', role: 'assistant', content: 'Error de conexión.' }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleCreateRoutineFromChat = async (data: typeof lastGeneratedRoutine) => {
        if (data) {
            // Clear chat memory before closing modal
            await clearAIChatMemory();
            onRoutineGenerated(data.exercises, data.name, data.description);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsgText = inputValue;
        const newMessage = { id: Date.now().toString(), role: 'user' as const, content: userMsgText };
        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setIsThinking(true);

        const result = await generateRoutine({
            ...preferences,
            chatContext: userMsgText,
            days: '4'
        });

        setIsThinking(false);

        if (result) {
            setLastGeneratedRoutine(result);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `He actualizado la rutina a: **${result.name}**.\n\n${result.description}`,
                routineData: result
            }]);
        } else {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Lo siento, no pude actualizar la rutina. Inténtalo de nuevo.' }]);
        }
    };

    const isStepComplete = () => {
        const step = onboardingSteps[onboardingStep];
        const val = preferences[step.id as keyof typeof preferences];
        if (Array.isArray(val)) return val.length > 0;
        return !!val;
    };

    const getProgress = () => {
        if (mode === 'chat') return 100;
        return ((onboardingStep + 1) / onboardingSteps.length) * 100;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    <motion.div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={handleCloseModal}
                    />

                    <motion.div
                        className="relative w-full h-[95vh] sm:h-[85vh] sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                        style={{
                            background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
                        }}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Dynamic Animated Gradient Background Effect based on Brand Color */}
                        <div
                            className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 animate-[spin_12s_linear_infinite] pointer-events-none"
                            style={{
                                background: `radial-gradient(circle farthest-corner at 50% 50%, ${primaryColor}, transparent 40%)`
                            }}
                        />
                        <div
                            className="absolute top-[-20%] right-[-20%] w-[100%] h-[100%] opacity-10 animate-pulse pointer-events-none"
                            style={{
                                background: `radial-gradient(circle farthest-corner at 50% 50%, ${primaryColor}, transparent 40%)`
                            }}
                        />

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 sticky top-0 z-30 bg-black/10 backdrop-blur-md">
                            <button
                                onClick={handleBack}
                                className="p-2 -ml-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
                                <span className="font-semibold text-white tracking-wide text-sm uppercase">
                                    {branding.companyName === 'GatoFit' ? 'Gatofit AI' : `${branding.companyName}`}
                                </span>
                            </div>

                            <button
                                onClick={handleCloseModal}
                                className="p-2 -mr-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 relative overflow-hidden flex flex-col z-10">

                            {/* Persistent Progress Bar */}
                            <div className="w-full h-1 bg-slate-800/50 absolute top-0 left-0 z-20">
                                <motion.div
                                    className="h-full"
                                    style={{ backgroundColor: primaryColor }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getProgress()}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            {/* MODE: ONBOARDING */}
                            {mode === 'onboarding' && (
                                <div className="flex flex-col h-full relative">
                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-8 pb-32">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={onboardingStep}
                                                variants={stepVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                className="flex flex-col"
                                            >
                                                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                                                    {onboardingSteps[onboardingStep].question}
                                                </h2>
                                                <p className="text-slate-400 text-sm mb-6">
                                                    {onboardingSteps[onboardingStep].multiSelect ? 'Selecciona una o más opciones' : 'Selecciona una opción'}
                                                </p>

                                                <div className="space-y-3">
                                                    {onboardingSteps[onboardingStep].id === 'focus_muscles' ? (
                                                        /* MUSCLE SELECTION ACCORDION LOGIC */
                                                        <div className="space-y-3">
                                                            {MUSCLE_GROUPS.map((group) => {
                                                                // Check if any sub-option is selected
                                                                const selectedCount = group.subOptions.filter(sub =>
                                                                    (preferences.focus_muscles as string[]).includes(sub.id)
                                                                ).length;
                                                                const isExpanded = expandedMuscle === group.id;

                                                                return (
                                                                    <div key={group.id} className="overflow-hidden rounded-xl bg-slate-800 border border-slate-700/50 transition-all">
                                                                        {/* Group Header */}
                                                                        <button
                                                                            onClick={() => {
                                                                                if (group.id === 'full_body') {
                                                                                    handleOptionSelect('focus_muscles', 'full_body');
                                                                                } else {
                                                                                    setExpandedMuscle(isExpanded ? null : group.id);
                                                                                }
                                                                            }}
                                                                            className={`w-full p-4 flex items-center justify-between transition-colors ${selectedCount > 0 || (group.id === 'full_body' && (preferences.focus_muscles as string[]).includes('full_body'))
                                                                                ? 'bg-slate-700/50'
                                                                                : 'hover:bg-slate-700/30'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="font-medium text-white">{group.label}</span>
                                                                                {selectedCount > 0 && group.id !== 'full_body' && (
                                                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-600 text-white">
                                                                                        {selectedCount}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {group.id !== 'full_body' ? (
                                                                                <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                                            ) : (
                                                                                (preferences.focus_muscles as string[]).includes('full_body') && (
                                                                                    <Check className="w-5 h-5 text-white" style={{ color: primaryColor }} />
                                                                                )
                                                                            )}
                                                                        </button>

                                                                        {/* Sub Options */}
                                                                        <AnimatePresence>
                                                                            {isExpanded && group.subOptions.length > 0 && (
                                                                                <motion.div
                                                                                    initial={{ height: 0, opacity: 0 }}
                                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                                    exit={{ height: 0, opacity: 0 }}
                                                                                    transition={{ duration: 0.2 }}
                                                                                >
                                                                                    <div className="px-4 pb-4 pt-2 grid grid-cols-2 gap-2">
                                                                                        {group.subOptions.map((sub) => {
                                                                                            const isSubSelected = (preferences.focus_muscles as string[]).includes(sub.id);
                                                                                            return (
                                                                                                <button
                                                                                                    key={sub.id}
                                                                                                    onClick={() => handleOptionSelect('focus_muscles', sub.id)}
                                                                                                    className={`
                                                                                                        p-2 rounded-lg text-sm border transition-all text-center
                                                                                                        ${isSubSelected
                                                                                                            ? 'text-white border-transparent shadow-sm'
                                                                                                            : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-700'
                                                                                                        }
                                                                                                    `}
                                                                                                    style={isSubSelected ? { backgroundColor: primaryColor } : {}}
                                                                                                >
                                                                                                    {sub.label}
                                                                                                </button>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        /* STANDARD STEP RENDERING (Buttons) */
                                                        onboardingSteps[onboardingStep].options.map((option) => {
                                                            const stepKey = onboardingSteps[onboardingStep].id as keyof typeof preferences;
                                                            const isSelected = onboardingSteps[onboardingStep].multiSelect
                                                                ? (preferences[stepKey] as string[]).includes(option.id)
                                                                : preferences[stepKey] === option.id;

                                                            return (
                                                                <motion.button
                                                                    key={option.id}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    onClick={() => handleOptionSelect(stepKey, option.id)}
                                                                    className={`
                                                                        w-full p-4 rounded-xl border flex items-center justify-between transition-all group text-left
                                                                        ${isSelected
                                                                            ? 'text-white border-transparent'
                                                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
                                                                        }
                                                                    `}
                                                                    style={isSelected ? {
                                                                        backgroundColor: primaryColor,
                                                                        boxShadow: `0 4px 15px ${primaryColor}40`
                                                                    } : {}}
                                                                >
                                                                    <span className="font-medium text-base">{option.label}</span>
                                                                    {isSelected && (
                                                                        <div className="bg-white/20 rounded-full p-1">
                                                                            <Check className="w-3 h-3 text-white" />
                                                                        </div>
                                                                    )}
                                                                </motion.button>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Fixed Bottom Button Area */}
                                    <div className="absolute bottom-0 left-0 w-full p-6 pt-12 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent z-20 pb-8 sm:pb-6">
                                        <button
                                            onClick={handleNextStep}
                                            disabled={!isStepComplete()}
                                            className={`
                                                w-full h-12 rounded-xl text-base font-semibold shadow-lg transition-all flex items-center justify-center gap-2
                                                ${!isStepComplete() ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'text-white hover:brightness-110 active:scale-[0.99]'}
                                            `}
                                            style={isStepComplete() ? {
                                                backgroundColor: primaryColor,
                                                boxShadow: `0 4px 20px ${primaryColor}40`
                                            } : {}}
                                        >
                                            {onboardingStep === onboardingSteps.length - 1 ? (
                                                <>Empezar <Play className="w-4 h-4 fill-current" /></>
                                            ) : (
                                                <>Siguiente <ChevronRight className="w-4 h-4" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* MODE: CHAT */}
                            {mode === 'chat' && (
                                <div className="flex flex-col h-full relative">
                                    <div className="flex-1 overflow-y-auto p-4 pt-20 space-y-6 pb-32" ref={messagesEndRef}>
                                        {/* Initial System Bubble */}
                                        <div className="flex justify-start animate-fade-in">
                                            <div className="bg-slate-800/50 border border-slate-700/50 text-slate-300 rounded-2xl p-4 rounded-bl-none text-sm max-w-[90%]">
                                                Analizando perfil ({preferences.goal}, {preferences.experience})...
                                            </div>
                                        </div>

                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`flex flex-col space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                                                <div
                                                    className={`rounded-2xl p-4 shadow-sm text-sm whitespace-pre-wrap leading-relaxed ${msg.role === 'user'
                                                        ? 'max-w-[90%] text-white rounded-br-none'
                                                        : 'w-full bg-slate-900/80 border border-slate-700/50 text-slate-200 rounded-bl-none backdrop-blur-md'
                                                        }`}
                                                    style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
                                                >
                                                    {msg.content}
                                                </div>

                                                {/* Action Button inside Assistant Bubble */}
                                                {msg.role === 'assistant' && msg.routineData && (
                                                    <div className="w-full pl-2 mt-2">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-3"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                                    <Dumbbell className="w-5 h-5" style={{ color: primaryColor }} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-white font-semibold text-sm truncate">{msg.routineData.name}</p>
                                                                    <p className="text-slate-400 text-xs truncate">{msg.routineData.exercises.length} Ejercicios</p>
                                                                </div>
                                                            </div>

                                                            {/* Exercise List - FULL LIST */}
                                                            <div className="space-y-1 py-2 border-t border-slate-800/50 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                                                {msg.routineData.exercises.map((ex: RoutineExercise, i: number) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => setSelectedExerciseDetails(ex)}
                                                                        className="w-full flex justify-between items-start p-2 rounded-lg hover:bg-white/5 transition-colors group text-left"
                                                                    >
                                                                        <div className="flex-1 min-w-0 pr-2">
                                                                            <p className="text-xs font-medium text-slate-200">{i + 1}. {ex.name}</p>
                                                                            <p className="text-[10px] text-slate-500">
                                                                                {ex.sets.length} series x {ex.sets[0].reps_min}-{ex.sets[0].reps_max} reps
                                                                            </p>
                                                                            {ex.notes && (
                                                                                <p className="text-[10px] text-indigo-300/90 italic mt-1 leading-relaxed">
                                                                                    "{ex.notes}"
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 mt-1" />
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleCreateRoutineFromChat(msg.routineData)}
                                                                className="w-full text-white text-xs h-9 border-0 shadow-lg shadow-indigo-500/20"
                                                                style={{ backgroundColor: primaryColor }}
                                                            >
                                                                Usar esta Rutina
                                                            </Button>
                                                        </motion.div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {isThinking && (
                                            <div className="flex justify-start">
                                                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 rounded-bl-none flex gap-1 items-center">
                                                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: primaryColor }}></span>
                                                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: primaryColor, opacity: 0.7 }}></span>
                                                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor, opacity: 0.4 }}></span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Fixed Chat Input with SOLID GLASS Background */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 pt-4 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 pb-6 sm:pb-4 z-20">
                                        <div className="relative flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Pedir cambios (ej. 'más repeticiones')..."
                                                className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-white text-sm focus:outline-none focus:ring-1 placeholder-slate-500 transition-all"
                                                style={{ borderColor: inputValue ? primaryColor : undefined }}
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!inputValue.trim() || isThinking}
                                                className={`absolute right-2 p-2 rounded-lg transition-all ${inputValue.trim() ? 'text-white' : 'text-slate-600'
                                                    }`}
                                                style={inputValue.trim() ? { backgroundColor: primaryColor } : {}}
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                    {/* Exercise Details Modal Overlay */}
                    <AnimatePresence>
                        {selectedExerciseDetails && (
                            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setSelectedExerciseDetails(null)}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                                />
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl z-[70] overflow-hidden"
                                >
                                    {/* Background Decor */}
                                    <div
                                        className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl pointer-events-none"
                                        style={{ backgroundColor: primaryColor }}
                                    />

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{selectedExerciseDetails.name}</h3>
                                            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full uppercase tracking-wider">
                                                {selectedExerciseDetails.muscle_group_main || 'General'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedExerciseDetails(null)}
                                            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/30 text-center">
                                            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Series</p>
                                            <p className="text-xl font-bold text-white">{selectedExerciseDetails.sets.length}</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/30 text-center">
                                            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Reps</p>
                                            <p className="text-xl font-bold text-white">
                                                {selectedExerciseDetails.sets[0].reps_min === selectedExerciseDetails.sets[0].reps_max
                                                    ? selectedExerciseDetails.sets[0].reps_max
                                                    : `${selectedExerciseDetails.sets[0].reps_min}-${selectedExerciseDetails.sets[0].reps_max}`}
                                            </p>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/30 text-center">
                                            <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Descanso</p>
                                            <p className="text-xl font-bold text-white">{selectedExerciseDetails.sets[0].rest_seconds}s</p>
                                        </div>
                                    </div>

                                    {selectedExerciseDetails.notes && (
                                        <div className="mb-6 relative z-10">
                                            <p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                                <span className="w-1 h-4 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                                                Notas del Coach AI
                                            </p>
                                            <div className="bg-slate-800/30 p-4 rounded-xl text-sm text-slate-300 italic border border-slate-700/30">
                                                "{selectedExerciseDetails.notes}"
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setSelectedExerciseDetails(null)}
                                        className="w-full py-3 rounded-xl font-medium text-white transition-all hover:brightness-110 active:scale-[0.98] relative z-10"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        Entendido
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AICreationModal;
