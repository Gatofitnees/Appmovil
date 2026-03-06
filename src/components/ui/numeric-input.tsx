
import * as React from "react"
import { cn } from "@/lib/utils"
import { KeyboardInput } from "./keyboard-input"

interface NumericInputProps extends React.ComponentProps<"input"> {
  allowDecimals?: boolean;
  maxDecimals?: number;
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

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ className, allowDecimals = false, maxDecimals = 1, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      if (allowDecimals) {
        // Replace comma with dot for consistency
        value = value.replace(',', '.');

        // Allow empty string, numbers, and decimal patterns
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
          // Prevent multiple dots
          const dotCount = (value.match(/\./g) || []).length;
          if (dotCount <= 1) {
            // Update the input value to show dot instead of comma
            e.target.value = value;
            onChange?.(e);
          }
        }
      } else {
        // Original integer-only behavior
        if (/^\d*$/.test(value)) {
          onChange?.(e);
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (allowDecimals) {
        // Allow comma key to act as decimal separator
        if (e.key === ',' && !e.currentTarget.value.includes('.') && !e.currentTarget.value.includes(',')) {
          e.preventDefault();
          // Directly update the input value
          const input = e.currentTarget;
          const newValue = input.value + '.';
          input.value = newValue;

          // Create a synthetic change event
          const syntheticEvent = {
            target: input,
            currentTarget: input,
            nativeEvent: e.nativeEvent,
            type: 'change',
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            eventPhase: 2,
            timeStamp: Date.now(),
            isTrusted: true,
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => { },
            preventDefault: () => { },
            stopPropagation: () => { }
          } as React.ChangeEvent<HTMLInputElement>;

          // Trigger the change handler
          if (onChange) {
            onChange(syntheticEvent);
          }
        }
      }
    };

    // Handle paste events to support comma decimal separator
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (allowDecimals) {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const normalizedText = pastedText.replace(',', '.');

        // Validate the pasted text
        if (/^\d*\.?\d*$/.test(normalizedText)) {
          const input = e.currentTarget;
          input.value = normalizedText;

          // Create a synthetic change event
          const syntheticEvent = {
            target: input,
            currentTarget: input,
            nativeEvent: e.nativeEvent,
            type: 'change',
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            eventPhase: 2,
            timeStamp: Date.now(),
            isTrusted: true,
            isDefaultPrevented: () => false,
            isPropagationStopped: () => false,
            persist: () => { },
            preventDefault: () => { },
            stopPropagation: () => { }
          } as React.ChangeEvent<HTMLInputElement>;

          // Trigger change if valid
          if (onChange) {
            onChange(syntheticEvent);
          }
        }
      }
    };

    return (
      <KeyboardInput
        type="text"
        inputMode={allowDecimals ? "decimal" : "numeric"}
        extraKey={allowDecimals ? "." : undefined}
        pattern={allowDecimals ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
          className
        )}
        onChange={handleChange}
        onValueChange={(val) => {
          const syntheticEvent = {
            target: { value: val },
            currentTarget: { value: val }
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          handleChange(syntheticEvent);
        }}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        ref={ref}
        onRIRSelect={props.onRIRSelect}
        onPartialToggle={props.onPartialToggle}
        onFailureToggle={props.onFailureToggle}
        isPartialActive={props.isPartialActive}
        isFailureActive={props.isFailureActive}
        showRIR={props.showRIR}
        showPartials={props.showPartials}
        partialButtonLabel={props.partialButtonLabel}
        leftButtonOverride={props.leftButtonOverride}
        rightButtonOverride={props.rightButtonOverride}
        activeRIR={props.activeRIR}
        showWeightControls={props.showWeightControls}
        hasPreviousWeight={props.hasPreviousWeight}
        onCopyPreviousWeight={props.onCopyPreviousWeight}
        onAdjustWeight={props.onAdjustWeight}
        onNext={props.onNext}
        onRirInfoClick={props.onRirInfoClick}
        {...props}
      />
    )
  }
)
NumericInput.displayName = "NumericInput"

export { NumericInput }
