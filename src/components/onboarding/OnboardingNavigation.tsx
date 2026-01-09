import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/Button";

interface OnboardingNavigationProps {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  loading?: boolean;
}

const OnboardingNavigation: React.FC<OnboardingNavigationProps> = ({
  onNext,
  onBack,
  nextLabel = "Continuar",
  nextDisabled = false,
  showBack = true,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    }
  };

  // Memoize style to prevent unnecessary recalculations
  const navStyle = useMemo(() => ({
    paddingBottom: `calc(2.5rem + var(--safe-area-inset-bottom))`,
    paddingLeft: `calc(1rem + var(--safe-area-inset-left))`,
    paddingRight: `calc(1rem + var(--safe-area-inset-right))`,
  }), []);

  // Avoid SSR/transform jitter by mounting into the document body
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      {/* Bottom overlay mask to prevent underlying content from showing through */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[180] pointer-events-none"
        style={{
          height: "140px",
          background:
            "linear-gradient(to top, rgba(var(--background-rgb, 20,27,36),1) 65%, rgba(var(--background-rgb, 20,27,36),0.85) 88%, rgba(var(--background-rgb, 20,27,36),0.6) 100%)",
        }}
      />

      <div
        className="fixed bottom-0 left-0 right-0 p-4 bg-background backdrop-blur-md border-t border-white/5 z-[200]"
        style={navStyle}
      >
        <div className="max-w-md mx-auto space-y-4">
          <Button
            onClick={handleNext}
            disabled={nextDisabled || loading}
            variant="primary"
            className="w-full py-3 px-4 h-auto"
          >
            {loading ? "Cargando..." : nextLabel}
          </Button>


        </div>
      </div>
    </>
    , document.body);
};

export default OnboardingNavigation;
