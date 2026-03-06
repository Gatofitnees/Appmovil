import React, { useState, useRef, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { CustomKeyboard, CustomKeyboardProps } from './custom-keyboard';
import { cn } from '@/lib/utils';

let singletonRoot: Root | null = null;
let singletonContainer: HTMLDivElement | null = null;
let activeKeyboardId: string | null = null;

const renderGlobalKeyboard = (props: CustomKeyboardProps) => {
    if (!singletonContainer) {
        singletonContainer = document.createElement('div');
        document.body.appendChild(singletonContainer);
        singletonRoot = createRoot(singletonContainer);
    }
    singletonRoot.render(<CustomKeyboard {...props} />);
};

const hideGlobalKeyboard = () => {
    if (singletonRoot) {
        singletonRoot.render(<CustomKeyboard isVisible={false} onKeyPress={() => { }} onDelete={() => { }} />);
    }
};


export interface KeyboardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    extraKey?: string;
    onValueChange?: (value: string) => void;
    onRIRSelect?: (rir: number | string | null) => void;
    onPartialToggle?: () => void;
    onFailureToggle?: () => void;
    isPartialActive?: boolean;
    isFailureActive?: boolean;
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

export const KeyboardInput = React.forwardRef<HTMLInputElement, KeyboardInputProps>(
    ({
        className, extraKey, value, onValueChange,
        onRIRSelect, onPartialToggle, onFailureToggle, isPartialActive, isFailureActive,
        showRIR, showPartials, partialButtonLabel, leftButtonOverride, rightButtonOverride,
        activeRIR, showWeightControls, hasPreviousWeight, onCopyPreviousWeight,
        onAdjustWeight, onNext, onRirInfoClick, ...props
    }, ref) => {
        const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
        const containerRef = useRef<HTMLDivElement>(null);
        const internalInputRef = useRef<HTMLInputElement>(null);
        // Generate unique ID for the container to distinguish events
        const containerId = useRef(`keyboard-input-${Math.random().toString(36).substr(2, 9)}`).current;

        // Merge refs
        const setRefs = (element: HTMLInputElement) => {
            internalInputRef.current = element;
            if (typeof ref === 'function') {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        };

        useEffect(() => {
            const handleCloseAll = (e: any) => {
                if (e.detail?.id !== containerId) {
                    setIsKeyboardOpen(false);
                }
            };

            const handleClickOutside = (event: PointerEvent | MouseEvent | TouchEvent) => {
                const target = event.target as Element;

                // Don't close if clicking inside the keyboard portal 
                if (target?.closest?.('#custom-keyboard-portal')) {
                    return;
                }

                if (
                    isKeyboardOpen &&
                    containerRef.current &&
                    !containerRef.current.contains(target as Node)
                ) {
                    setIsKeyboardOpen(false);
                }
            };

            // Use capturing phase to ensure we catch it before other elements stop propagation
            document.addEventListener('close-custom-keyboards', handleCloseAll);
            document.addEventListener('pointerdown', handleClickOutside, true);
            document.addEventListener('touchstart', handleClickOutside, true);

            return () => {
                document.removeEventListener('close-custom-keyboards', handleCloseAll);
                document.removeEventListener('pointerdown', handleClickOutside, true);
                document.removeEventListener('touchstart', handleClickOutside, true);
            };
        }, [isKeyboardOpen, containerId]);

        const triggerChange = (newValue: string) => {
            if (onValueChange) {
                onValueChange(newValue);
            }
            if (props.onChange && internalInputRef.current) {
                // Determine if we need to mock a full event (usually true for custom components)
                const syntheticEvent = {
                    ...new Event('change', { bubbles: true }),
                    target: { ...internalInputRef.current, value: newValue },
                    currentTarget: { ...internalInputRef.current, value: newValue },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                props.onChange(syntheticEvent);
            }
        };

        const handleKeyPress = (key: string) => {
            const currentValue = value?.toString() || '';
            const newValue = currentValue + key;
            triggerChange(newValue);
        };

        const handleDelete = () => {
            const currentValue = value?.toString() || '';
            if (currentValue.length > 0) {
                const newValue = currentValue.slice(0, -1);
                triggerChange(newValue);
            }
        };


        const handleNext = () => {
            if (onNext) {
                onNext();
                return;
            }
            if (!internalInputRef.current) return;
            const inputs = Array.from(document.querySelectorAll('input[inputMode="none"]')) as HTMLInputElement[];
            const currentIndex = inputs.indexOf(internalInputRef.current);
            if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
                const nextInput = inputs[currentIndex + 1];
                nextInput.focus();
                nextInput.click();
            } else {
                setIsKeyboardOpen(false);
            }
        };

        // Render to the global singleton whenever state changes or it opens
        useEffect(() => {
            if (isKeyboardOpen) {
                activeKeyboardId = containerId;
                renderGlobalKeyboard({
                    isVisible: true,
                    extraKey,
                    onKeyPress: handleKeyPress,
                    onDelete: handleDelete,
                    onClose: () => setIsKeyboardOpen(false),
                    onRIRSelect: onRIRSelect,
                    onPartialToggle: onPartialToggle,
                    onFailureToggle: onFailureToggle,
                    isPartialActive: isPartialActive,
                    isFailureActive: isFailureActive,
                    showRIR: showRIR,
                    showPartials: showPartials,
                    partialButtonLabel: partialButtonLabel,
                    leftButtonOverride: leftButtonOverride,
                    rightButtonOverride: rightButtonOverride,
                    activeRIR: activeRIR,
                    showWeightControls: showWeightControls,
                    hasPreviousWeight: hasPreviousWeight,
                    onCopyPreviousWeight: onCopyPreviousWeight,
                    onAdjustWeight: onAdjustWeight,
                    onNext: handleNext,
                    onRirInfoClick: onRirInfoClick,
                    onConfirm: () => setIsKeyboardOpen(false)
                });
            } else {
                setTimeout(() => {
                    if (activeKeyboardId === containerId) {
                        activeKeyboardId = null;
                        hideGlobalKeyboard();
                    }
                }, 20);
            }
        }, [isKeyboardOpen, value, props, extraKey]);

        return (
            <div ref={containerRef} id={containerId} className="relative w-full h-full">
                <input
                    {...props}
                    ref={setRefs}
                    type="text"
                    inputMode="none" // PREVENTS NATIVE KEYBOARD
                    value={value}
                    onChange={(e) => {
                        if (props.onChange) props.onChange(e);
                        if (onValueChange) onValueChange(e.target.value);
                    }}
                    onClick={(e) => {
                        setIsKeyboardOpen(true);
                        if (props.onClick) props.onClick(e);
                    }}
                    onFocus={(e) => {
                        // Close all other keyboards
                        document.dispatchEvent(new CustomEvent('close-custom-keyboards', {
                            detail: { id: containerId }
                        }));
                        setIsKeyboardOpen(true);
                        if (props.onFocus) props.onFocus(e);
                    }}
                    onPointerDown={(e) => {
                        // Prevents native keyboard focus blink while still allowing our onClick to fire
                        e.preventDefault();

                        // Close all other keyboards
                        document.dispatchEvent(new CustomEvent('close-custom-keyboards', {
                            detail: { id: containerId }
                        }));

                        setIsKeyboardOpen(true);
                        // Make sure the input receives focus so we see the caret
                        internalInputRef.current?.focus();
                    }}
                    className={cn(
                        "cursor-text",
                        isKeyboardOpen && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                        className
                    )}
                />
            </div>
        );
    }
);

KeyboardInput.displayName = 'KeyboardInput';
