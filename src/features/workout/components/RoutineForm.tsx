
import React from "react";
import { ROUTINE_TYPES_FOR_UI } from "../utils/routineTypeMapping";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoutineFormProps {
  routineName: string;
  routineDescription: string;
  routineType: string;
  validationErrors: {
    name: boolean;
    type: boolean;
  };
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onTypeChange: (type: string) => void;
}

const RoutineForm: React.FC<RoutineFormProps> = ({
  routineName,
  routineDescription,
  routineType,
  validationErrors,
  onNameChange,
  onDescriptionChange,
  onTypeChange
}) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Nombre de la rutina *
        </label>
        <input
          type="text"
          value={routineName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej: Rutina de fuerza para principiantes"
          className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground ${validationErrors.name ? 'border-red-500' : 'border-border'
            }`}
        />
        {validationErrors.name && (
          <p className="text-red-500 text-xs mt-1">El nombre es requerido</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Descripción (opcional)
        </label>
        <textarea
          value={routineDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe el objetivo de esta rutina..."
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Tipo de rutina *
        </label>
        <Select value={routineType} onValueChange={onTypeChange}>
          <SelectTrigger
            className={`w-full ${validationErrors.type ? 'border-red-500' : 'border-border'
              }`}
          >
            <SelectValue placeholder="Selecciona un tipo" />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-sm border border-secondary max-h-60">
            {ROUTINE_TYPES_FOR_UI.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {validationErrors.type && (
          <p className="text-red-500 text-xs mt-1">El tipo es requerido</p>
        )}
      </div>
    </>
  );
};

export default RoutineForm;
