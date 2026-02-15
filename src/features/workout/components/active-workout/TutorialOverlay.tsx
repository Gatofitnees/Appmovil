import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TutorialStep {
    targetId?: string; // If undefined, show centered modal
    title: string;
    description: string;
    position?: 'top' | 'bottom';
}

interface TutorialOverlayProps {
    steps: TutorialStep[];
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
    steps,
    isOpen,
    onComplete,
    onSkip
}) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStep = steps[currentStepIndex];

    useEffect(() => {
        if (!isOpen) return;

        const findTarget = () => {
            if (currentStep.targetId) {
                const element = document.getElementById(currentStep.targetId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    setTargetRect(rect);
                    // Scroll element into view
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    setTargetRect(null);
                }
            } else {
                setTargetRect(null);
            }
        };

        // Single delayed check to ensure layout is stable and prevent "jumping"
        const timeout = setTimeout(findTarget, 100);

        window.addEventListener('resize', findTarget);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', findTarget);
        };
    }, [currentStepIndex, isOpen, currentStep]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    if (!isOpen) return null;

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!targetRect) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                position: 'fixed' as const
            };
        }

        // Default to bottom if not specified or specified bottom
        const isTop = currentStep.position === 'top';
        const topPos = isTop
            ? targetRect.top - 16 // Above + gap
            : targetRect.bottom + 16; // Below + gap

        return {
            top: topPos,
            left: '50%', // Center horizontally relative to viewport usually works best for mobile
            transform: isTop ? 'translate(-50%, -100%)' : 'translate(-50%, 0)', // Adjust anchor point
            position: 'fixed' as const,
            width: '90%',
            maxWidth: '350px'
        };
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto touch-none">
            {/* Backdrop - SVG with mask for the spotlight hole */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.left - 4}
                                y={targetRect.top - 4}
                                width={targetRect.width + 8}
                                height={targetRect.height + 8}
                                rx="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.85)"
                    mask="url(#spotlight-mask)"
                />
                {/* Outline around the hole - Solid Static Line (Simple) */}
                {targetRect && (
                    <rect
                        x={targetRect.left - 4}
                        y={targetRect.top - 4}
                        width={targetRect.width + 8}
                        height={targetRect.height + 8}
                        rx="12"
                        fill="none"
                        stroke="white"
                        strokeOpacity="0.5"
                        strokeWidth="2"
                    />
                )}
            </svg>

            {/* Content Card - Liquid Glass Style */}
            <div
                className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-300 flex flex-col"
                style={getTooltipStyle()}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-foreground tracking-tight">{currentStep.title}</h3>
                    {/* Skip button removed to maximize engagement */}
                </div>

                <p className="text-muted-foreground text-sm mb-6 leading-relaxed font-medium">
                    {currentStep.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-2 gap-4">
                    {/* Dots indicator */}
                    <div className="flex gap-1.5 shrink-0">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`transition-all duration-500 h-1.5 rounded-full ${i === currentStepIndex
                                    ? 'w-6 bg-primary shadow-[0_0_10px_hsl(var(--primary))]'
                                    : 'w-1.5 bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        size="sm"
                        onClick={handleNext}
                        className="gap-2 font-semibold shadow-lg shadow-primary/25 rounded-full px-5 h-9 transition-all hover:scale-105 active:scale-95 shrink whitespace-nowrap"
                    >
                        {currentStepIndex === steps.length - 1 ? 'Terminar' : 'Siguiente'}
                        {currentStepIndex < steps.length - 1 ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
