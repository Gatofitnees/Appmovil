import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";

const TargetWeight: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(OnboardingContext);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  if (!context) {
    throw new Error("TargetWeight must be used within OnboardingContext");
  }

  const { data, updateData } = context;
  const currentWeight = data.weight || 70;

  // Initialize with existing target or calculate smart default based on goal
  const getSmartDefault = () => {
    switch (data.mainGoal) {
      case "gain_muscle": return currentWeight + 5;
      case "lose_weight": return currentWeight - 5;
      default: return currentWeight; // maintain_weight or undefined
    }
  };

  const initialWeight = data.targetWeight ?? getSmartDefault();
  const [localWeight, setLocalWeight] = useState(initialWeight);

  // Configuration for the ruler
  const minWeight = 30;
  const maxWeight = 180;
  const pixelsPerKg = 100; // 1kg = 100px space (10px per 0.1kg)
  const minorTickGap = 10; // 10px between each 0.1kg tick

  // Calculate goal status text
  let statusText = "Mantener peso";
  if (localWeight > currentWeight + 0.5) {
    statusText = "Ganar peso";
  } else if (localWeight < currentWeight - 0.5) {
    statusText = "Perder peso";
  }

  // Initial Scroll Positioning
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Calculate position: (Weight - Min) * PixelsPerKg
      const position = (initialWeight - minWeight) * pixelsPerKg;
      // Center it: Position - (ContainerWidth / 2)
      // We need to wait for layout/render? Usually fine in useEffect.
      // Add padding offset
      const centerOffset = container.clientWidth / 2;
      container.scrollLeft = position;
    }
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;

      // Calculate weight from scroll
      // weight = min + (scroll / pixelsPerKg)
      let calculatedWeight = minWeight + (scrollLeft / pixelsPerKg);

      // Clamp
      calculatedWeight = Math.max(minWeight, Math.min(maxWeight, calculatedWeight));

      // Round to 1 decimal
      const rounded = Math.round(calculatedWeight * 10) / 10;

      setLocalWeight(rounded);
      setIsScrolling(true);

      // Stop "scrolling" state after a bit (for snap effects if needed, but linear is fine)
      clearTimeout((window as any).scrollTimeout);
      (window as any).scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        // Sync with context when stopped scrolling to avoid flutter
        updateData({ targetWeight: rounded });
      }, 100);
    }
  };

  const handleNext = () => {
    // Ensure final value is saved
    updateData({ targetWeight: localWeight });
    navigate("/onboarding/goal-realism");
  };

  // Generate ruler ticks
  // We can render a set of ticks. Since range is large (150kg = 1500 ticks), 
  // we might want to virtualize or just render them all (1500 divs is okay in modern React usually, but let's be efficient).
  // Let's just render integers with labels, and 9 ticks in between.
  const ticks = [];
  for (let w = minWeight; w <= maxWeight; w++) {
    ticks.push(
      <div key={w} className="flex-shrink-0 flex flex-col items-center justify-end" style={{ width: `${pixelsPerKg}px` }}>
        {/* The main integer tick is at the START of this block */}
        <div className="relative w-full h-full flex items-end justify-start">
          {/* Integer Tick - LIGHTER */}
          <div className="absolute left-0 bottom-0 w-0.5 h-12 bg-white/20 flex flex-col items-center gap-2">
            <span className="absolute -top-8 text-xs font-medium text-foreground transform -translate-x-1/2 select-none">
              {w}
            </span>
          </div>

          {/* Minor Ticks (0.1 - 0.9) - LIGHTER */}
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 w-px h-6 bg-white/5"
              style={{ left: `${(i + 1) * 10}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout currentStep={9} totalSteps={20}>
      <div className="flex flex-col items-center w-full max-w-md mx-auto">

        {/* Header */}
        <div className="text-center mb-10 w-full">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-secondary/20 transition-colors">
              {/* Reuse arrow if needed or use OnboardingNav's back logic. Welcome had custom headers. 
                      Standard OnboardingLayout has the bar. I assume arrow is there. 
                      User image shows arrow.
                  */}
            </button>
            {/* Image has the progress bar + title */}
          </div>

          <h1 className="text-3xl font-bold mb-8 text-center">¿Cuál es tu peso deseado?</h1>
        </div>

        {/* Dynamic Status & Value */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {statusText}
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl font-bold tracking-tight">
              {localWeight.toFixed(1)}
            </span>
            <span className="text-xl font-medium text-muted-foreground">kg</span>
          </div>
        </div>

        {/* Ruler Container */}
        <div className="relative w-full h-32 mb-8">
          {/* Center Indicator (Solid Celeste, No Shadow) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary z-20 transform -translate-x-1/2 pointer-events-none rounded-full" />

          {/* Scroll Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-full overflow-x-auto overflow-y-hidden flex items-end scrollbar-hide select-none cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingLeft: '50%', // Half screen padding to center first item
              paddingRight: '50%'
            }}
          >
            <div className="flex h-20 items-end relative">
              {/* Trail Highlight - NO TRANSITION to avoid lag */}
              <div
                className="absolute top-0 bottom-0 bg-primary/20 pointer-events-none"
                style={{
                  left: `${(Math.min(currentWeight, localWeight) - minWeight) * pixelsPerKg}px`,
                  width: `${Math.max(0, Math.abs(localWeight - currentWeight) * pixelsPerKg)}px`,
                }}
              />

              {ticks}
              {/* Last Tick Closer */}
              <div className="w-px h-12 bg-white/20 flex-shrink-0 relative">
                <span className="absolute -top-8 text-xs font-medium text-foreground transform -translate-x-1/2 select-none">
                  {maxWeight + 1}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <OnboardingNavigation
        onNext={handleNext}
      />
    </OnboardingLayout>
  );
};

export default TargetWeight;
