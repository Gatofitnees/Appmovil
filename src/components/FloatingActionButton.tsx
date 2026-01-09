
import React from "react";
import Button from "./Button";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div
      className="fixed right-4 z-50"
      style={{ bottom: 'calc(6rem + var(--safe-area-inset-bottom))' }}
    >
      <Button
        variant="primary"
        className="rounded-full h-14 w-14 shadow-lg"
        onClick={onClick}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default FloatingActionButton;
