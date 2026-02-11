
import React, { useState } from "react";
import { Plus, Calendar, Dumbbell, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranding } from "@/contexts/BrandingContext";
import { PremiumModal } from "@/components/premium/PremiumModal";

interface FloatingActionMenuProps {
  onCreateRoutine: () => void;
  onCreateProgram: () => void;
  onOpenGatofitPrograms: () => void;
  isAsesorado?: boolean;
  isPremium?: boolean;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  onCreateRoutine,
  onCreateProgram,
  onOpenGatofitPrograms,
  isAsesorado = false,
  isPremium = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGatofitPremiumModal, setShowGatofitPremiumModal] = useState(false);
  const { branding } = useBranding();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const getButtonStyle = () => {
    if (!branding.hasCoach) return {};
    return {
      backgroundColor: branding.primaryButtonColor,
      color: '#ffffff'
    };
  };

  return (
    <div
      className="fixed right-4 z-50"
      style={{ bottom: 'calc(5.5rem + var(--safe-area-inset-bottom))' }}
    >
      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3 mb-4">
        {/* Gatofit Programs button - Shown to all non-asesorado users */}
        {!isAsesorado && (
          <div
            className={cn(
              "transition-all duration-300 transform relative",
              isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
            )}
          >
            <button
              onClick={() => {
                if (isPremium) {
                  onOpenGatofitPrograms();
                } else {
                  setShowGatofitPremiumModal(true);
                }
                setIsOpen(false);
              }}
              className="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110 overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Galactic aura border */}
              <div
                className="absolute inset-0 rounded-full opacity-75 animate-pulse"
                style={{
                  background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
                  padding: '2px'
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
              </div>

              {/* Inner content with full circular image */}
              <div className="relative z-10 w-10 h-10 rounded-full overflow-hidden bg-white">
                <img
                  src={branding.logoImageUrl}
                  alt={`${branding.companyName} Logo`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Lock overlay for free users */}
              {!isPremium && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 rounded-full">
                  <Lock className="h-6 w-6 text-white" />
                </div>
              )}
            </button>
            <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold drop-shadow-sm" style={{
                textShadow: '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
              }}>
                Programas {branding.companyName}
              </span>
            </span>
          </div>
        )}

        {/* Create Program button - Only visible when menu is open */}
        <div
          className={cn(
            "transition-all duration-300 transform",
            isOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          )}
        >
          <button
            onClick={() => {
              onCreateProgram();
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110",
              !branding.hasCoach && "bg-blue-500 hover:bg-blue-600"
            )}
            style={branding.hasCoach ? getButtonStyle() : undefined}
          >
            <Calendar className="h-6 w-6" />
          </button>
          {isOpen && (
            <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
              Crear Programación
            </span>
          )}
        </div>

        {/* Create Routine button */}
        <div
          className={cn(
            "transition-all duration-300 transform",
            isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          )}
        >
          <button
            onClick={() => {
              onCreateRoutine();
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110",
              !branding.hasCoach && "bg-blue-500 hover:bg-blue-600"
            )}
            style={branding.hasCoach ? getButtonStyle() : undefined}
          >
            <Dumbbell className="h-6 w-6" />
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
            Crear Rutina
          </span>
        </div>
      </div>

      {/* Main toggle button */}
      <button
        onClick={toggleMenu}
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 text-white",
          isOpen
            ? !branding.hasCoach && "bg-red-500 hover:bg-red-600 rotate-45"
            : !branding.hasCoach && "bg-blue-500 hover:bg-blue-600 hover:scale-110",
          isOpen && "rotate-45",
          !isOpen && "hover:scale-110"
        )}
        style={branding.hasCoach ? getButtonStyle() : undefined}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Premium Modal for Gatofit Programs */}
      <PremiumModal
        isOpen={showGatofitPremiumModal}
        onClose={() => setShowGatofitPremiumModal(false)}
        feature="gatofit_programs"
      />
    </div>
  );
};

export default FloatingActionMenu;
