import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Delete, Keyboard, Dumbbell, ArrowRight, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomKeyboardProps {
    onKeyPress: (key: string) => void;
    onDelete: () => void;
    onConfirm?: () => void;
    extraKey?: string;
    onRIRSelect?: (rir: number | string | null) => void;
    onPartialToggle?: () => void;
    onFailureToggle?: () => void;
    isPartialActive?: boolean;
    isFailureActive?: boolean;
    className?: string;
    isVisible: boolean;
    onClose?: () => void;
    showRIR?: boolean;
    showPartials?: boolean;
    partialButtonLabel?: string;
    leftButtonOverride?: { label: string; active: boolean; onClick: () => void };
    rightButtonOverride?: { label: string; active: boolean; onClick: () => void };
    activeRIR?: number | string | null;
    showWeightControls?: boolean;
    hasPreviousWeight?: boolean;
    onCopyPreviousWeight?: () => void;
    onAdjustWeight?: (amount: number) => void;
    onNext?: () => void;
    onRirInfoClick?: () => void;
}

export const CustomKeyboard: React.FC<CustomKeyboardProps> = ({
    onKeyPress,
    onDelete,
    onConfirm,
    extraKey,
    onRIRSelect,
    onPartialToggle,
    onFailureToggle,
    isPartialActive,
    isFailureActive,
    className,
    isVisible,
    onClose,
    showRIR = false,
    showPartials = false,
    partialButtonLabel = "P",
    leftButtonOverride,
    rightButtonOverride,
    activeRIR,
    showWeightControls = false,
    hasPreviousWeight = false,
    onCopyPreviousWeight,
    onAdjustWeight,
    onNext,
    onRirInfoClick,
}) => {
    const [isPressing, setIsPressing] = useState<string | null>(null);
    // RIR row is visible by default
    const [rirRowVisible, setRirRowVisible] = useState(true);

    // Check if another keyboard was already in the DOM or recently closed
    const [shouldAnimate] = useState(() => {
        const portalExists = !!document.getElementById('custom-keyboard-portal');
        const recentlyClosed = !!(window as any).__customKeyboardClosing;
        return !portalExists && !recentlyClosed;
    });

    // When this keyboard unmounts, set a brief flag to prevent the next one from animating
    React.useEffect(() => {
        return () => {
            (window as any).__customKeyboardClosing = true;
            setTimeout(() => {
                (window as any).__customKeyboardClosing = false;
            }, 100);
        };
    }, []);

    if (!isVisible) return null;

    const handleTouchStart = (key: string) => setIsPressing(key);
    const handleTouchEnd = () => setIsPressing(null);

    const KeyButton = ({
        value,
        label,
        action,
        isExtra = false,
        active = false,
        className: btnClassName
    }: {
        value: string,
        label?: React.ReactNode,
        action: () => void,
        isExtra?: boolean,
        active?: boolean,
        className?: string
    }) => {
        return (
            <button
                type="button"
                className={cn(
                    "flex items-center justify-center rounded-lg h-14 transition-all duration-150",
                    "text-2xl font-light",
                    active ? "bg-white text-black" : "bg-[#2C2C2E] text-white",
                    isPressing === value && !active && "bg-[#4C4C4E]",
                    isExtra && "bg-[#3A3A3C] text-xl",
                    btnClassName
                )}
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    action();
                    handleTouchStart(value);
                }}
                onPointerUp={handleTouchEnd}
                onPointerLeave={handleTouchEnd}
            >
                {label || value}
            </button>
        );
    };

    const RIRButton = ({ value, color, label }: { value: number | string | null, color: string, label: string }) => {
        const isActive = activeRIR !== null && activeRIR !== undefined && activeRIR.toString() === value?.toString();
        return (
            <button
                type="button"
                className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all active:scale-95",
                    color,
                    "text-white shadow-lg",
                    isActive && "ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1E] scale-110"
                )}
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isActive) {
                        onRIRSelect?.(null);
                    } else {
                        onRIRSelect?.(value);
                    }
                }}
            >
                {label}
            </button>
        );
    };

    return createPortal(
        <div
            id="custom-keyboard-portal"
            className={cn(
                "fixed bottom-0 left-0 right-0 bg-[#1C1C1E]/95 backdrop-blur-md shadow-2xl z-[100] duration-300 rounded-t-3xl border-t border-white/10",
                shouldAnimate && "animate-in slide-in-from-bottom-full",
                className
            )}
        >
            <div className="w-full max-w-md mx-auto p-4 pt-4 pb-8 flex flex-col gap-3">

                {/* RIR Row — shown only when toggled */}
                {showRIR && rirRowVisible && (
                    <div className="flex justify-between items-center px-2 py-2 border-b border-white/5">
                        <RIRButton value={0} color="bg-red-600" label="0" />
                        <RIRButton value={1} color="bg-red-500" label="1" />
                        <RIRButton value={2} color="bg-orange-500" label="2" />
                        <RIRButton value={3} color="bg-yellow-500" label="3" />
                        <RIRButton value={4} color="bg-green-500" label="4" />
                        <RIRButton value={5} color="bg-green-600" label="5" />
                        <RIRButton value="6+" color="bg-blue-600" label="6+" />
                        <button
                            type="button"
                            className="flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all active:scale-95 bg-zinc-600 text-white shadow-lg"
                            onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRirInfoClick?.();
                            }}
                        >
                            ?
                        </button>
                    </div>
                )}

                {/* Main grid + right toolbar on same row */}
                <div className="flex gap-3 items-stretch">
                    {/* Numeric Grid — 3 col, 4 rows */}
                    <div className="grid grid-cols-3 gap-3 flex-[3]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <KeyButton key={num} value={num.toString()} action={() => onKeyPress(num.toString())} />
                        ))}

                        {extraKey ? (
                            <KeyButton value={extraKey} isExtra action={() => onKeyPress(extraKey)} />
                        ) : (
                            <div />
                        )}
                        <KeyButton value="0" action={() => onKeyPress("0")} />
                        <button
                            type="button"
                            className="flex items-center justify-center rounded-lg h-14 bg-[#3A3A3C] text-white active:bg-[#4C4C4E] transition-colors"
                            onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Delete className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Right Toolbar — 4 rows */}
                    <div className="flex flex-col gap-3 flex-1">
                        {/* Row 1: Close Keyboard */}
                        <KeyButton
                            value="close"
                            isExtra
                            label={<img src="/keyboard-down.svg" alt="Cerrar teclado" className="h-7 w-7 invert opacity-80" />}
                            action={() => onClose?.()}
                        />

                        {/* Row 2: RIR toggle button OR Dumbbell */}
                        {showRIR ? (
                            <KeyButton
                                value="rir-toggle"
                                isExtra
                                active={rirRowVisible}
                                label={<span className="text-xs font-bold tracking-widest">RIR</span>}
                                action={() => setRirRowVisible(prev => !prev)}
                            />
                        ) : showWeightControls ? (
                            <KeyButton
                                value="dumbbell"
                                isExtra
                                className={cn(!hasPreviousWeight && "opacity-50")}
                                label={<img src="/gimnasia.svg" alt="Copiar anterior" className="h-6 w-6 invert opacity-80" />}
                                action={() => {
                                    if (hasPreviousWeight) onCopyPreviousWeight?.();
                                }}
                            />
                        ) : (
                            <div className="h-14" />
                        )}

                        {/* Row 3: F / P (if Partials present) OR - / + (if Weight) */}
                        {showPartials ? (
                            <div className="flex h-14 bg-[#2C2C2E] rounded-lg overflow-hidden border border-white/5">
                                <button
                                    type="button"
                                    className={cn(
                                        "flex-1 flex items-center justify-center text-sm font-bold transition-colors",
                                        (leftButtonOverride ? leftButtonOverride.active : isFailureActive) ? "bg-white text-black" : "text-white"
                                    )}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        if (leftButtonOverride) leftButtonOverride.onClick();
                                        else onFailureToggle?.();
                                    }}
                                >
                                    {leftButtonOverride ? leftButtonOverride.label : "F"}
                                </button>
                                <button
                                    type="button"
                                    className={cn(
                                        "flex-1 flex items-center justify-center text-sm font-bold transition-colors border-l border-white/10",
                                        (rightButtonOverride ? rightButtonOverride.active : isPartialActive) ? "bg-white text-black" : "text-white"
                                    )}
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        if (rightButtonOverride) rightButtonOverride.onClick();
                                        else onPartialToggle?.();
                                    }}
                                >
                                    {rightButtonOverride ? rightButtonOverride.label : partialButtonLabel}
                                </button>
                            </div>
                        ) : showWeightControls ? (
                            <div className="flex h-14 bg-[#2C2C2E] rounded-lg overflow-hidden border border-white/5">
                                <button
                                    type="button"
                                    className="flex-1 flex items-center justify-center text-white transition-colors active:bg-[#4C4C4E]"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAdjustWeight?.(-2.5);
                                    }}
                                >
                                    <Minus className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 flex items-center justify-center text-white transition-colors border-l border-white/10 active:bg-[#4C4C4E]"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAdjustWeight?.(2.5);
                                    }}
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="h-14" />
                        )}

                        {/* Row 4: Next Input Arrow */}
                        <button
                            type="button"
                            className="flex items-center justify-center rounded-lg h-14 bg-white text-black active:bg-gray-200 transition-colors shadow-sm"
                            onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onNext) onNext();
                                else onClose?.();
                            }}
                        >
                            <ArrowRight className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
