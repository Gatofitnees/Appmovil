import React, { useState } from 'react';
import { Camera, Search, Plus, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAdminNutritionProgram } from '@/hooks/useAdminNutritionProgram';
import { useLocalTimezone } from '@/hooks/useLocalTimezone';
import { useBranding } from '@/contexts/BrandingContext';

interface AddFoodMenuProps {
  onCameraClick: () => void;
  selectedDate: Date;
}

const AddFoodMenu: React.FC<AddFoodMenuProps> = ({ onCameraClick, selectedDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { hasNutritionPlan, loading } = useAdminNutritionProgram(selectedDate);
  const { getLocalDateString } = useLocalTimezone();
  const { branding } = useBranding();

  const getButtonStyle = () => {
    if (!branding.hasCoach) return {};
    return {
      backgroundColor: branding.primaryButtonColor,
      color: '#ffffff'
    };
  };

  const getButtonHoverClass = () => {
    return branding.hasCoach ? '' : 'hover:bg-blue-600';
  };

  const handleSearchFood = () => {
    setIsOpen(false);
    const dateString = getLocalDateString(selectedDate);
    navigate(`/nutrition/search?date=${dateString}`);
  };

  const handleCameraClick = () => {
    setIsOpen(false);
    onCameraClick();
  };

  const handleNutritionClick = () => {
    setIsOpen(false);
    const dateString = getLocalDateString(selectedDate);
    navigate(`/nutrition-program?date=${dateString}`);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="fixed right-4 z-50"
      style={{ bottom: 'calc(6rem + var(--safe-area-inset-bottom))' }}
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
        {/* Nutrition Program button */}
        {!loading && hasNutritionPlan && (
          <div
            className={cn(
              "transition-all duration-300 transform",
              isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
            )}
          >
            <button
              onClick={handleNutritionClick}
              className={cn(
                "flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110",
                !branding.hasCoach && "bg-green-500 hover:bg-green-600"
              )}
              style={branding.hasCoach ? getButtonStyle() : undefined}
            >
              <UtensilsCrossed className="h-6 w-6" />
            </button>
            <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
              Alimentación
            </span>
          </div>
        )}

        {/* Search Food button */}
        <div
          className={cn(
            "transition-all duration-300 transform",
            isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          )}
        >
          <button
            onClick={handleSearchFood}
            className={cn(
              "flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110",
              !branding.hasCoach && "bg-blue-500 hover:bg-blue-600"
            )}
            style={branding.hasCoach ? getButtonStyle() : undefined}
          >
            <Search className="h-6 w-6" />
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
            Buscar comida
          </span>
        </div>

        {/* Camera Scan button */}
        <div
          className={cn(
            "transition-all duration-300 transform",
            isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          )}
        >
          <button
            onClick={handleCameraClick}
            className={cn(
              "flex items-center justify-center w-12 h-12 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110",
              !branding.hasCoach && "bg-blue-500 hover:bg-blue-600"
            )}
            style={branding.hasCoach ? getButtonStyle() : undefined}
          >
            <Camera className="h-6 w-6" />
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-foreground whitespace-nowrap shadow-lg border border-border/50">
            Escanear
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
    </div>
  );
};

export default AddFoodMenu;