import React from "react";
import Button from "./Button";
import { Plus } from "lucide-react";
import { useHaptics } from "@/hooks/useHaptics";
import { ImpactStyle } from "@capacitor/haptics";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const { hapticImpact } = useHaptics();

  const handleClick = () => {
    hapticImpact(ImpactStyle.Light);
    onClick();
  };

  return (
    <div
      className="fixed right-4 z-50"
      style={{ bottom: 'calc(6rem + var(--safe-area-inset-bottom))' }}
    >
      <Button
        variant="primary"
        className="rounded-full h-14 w-14 shadow-lg"
        onClick={handleClick}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default FloatingActionButton;
