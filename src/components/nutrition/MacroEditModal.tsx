
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Button from '@/components/Button';

interface MacroEditModalProps {
  editingMacro: string | null;
  currentValue: string | number;
  onClose: () => void;
  onUpdate: (type: string, value: string | number) => void;
}

export const MacroEditModal: React.FC<MacroEditModalProps> = ({
  editingMacro,
  currentValue,
  onClose,
  onUpdate
}) => {
  const [localValue, setLocalValue] = React.useState(currentValue);

  useEffect(() => {
    setLocalValue(currentValue);
  }, [currentValue]);

  if (!editingMacro) return null;

  const getMacroLabel = (macro: string) => {
    switch (macro) {
      case 'protein_g': return 'Proteína';
      case 'carbs_g': return 'Carbohidratos';
      case 'fat_g': return 'Grasas';
      case 'calories': return 'Calorías';
      case 'grams': return 'Gramos';
      case 'name': return 'Nombre';
      default: return macro;
    }
  };

  const handleSave = () => {
    let finalValue = localValue;
    if (editingMacro !== 'name') {
      finalValue = parseFloat(String(localValue)) || 0;
    }
    onUpdate(editingMacro.replace('_consumed', ''), finalValue as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="neu-card p-6 w-full max-w-sm bg-card border border-border">
        <h3 className="text-lg font-medium mb-4">
          Editar {getMacroLabel(editingMacro)}
        </h3>
        <Input
          type={editingMacro === 'name' ? 'text' : 'number'}
          inputMode={editingMacro === 'name' ? 'text' : 'decimal'}
          pattern={editingMacro === 'name' ? undefined : '[0-9]*'}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value as any)}
          className="mb-4"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} className="flex-1">
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};
