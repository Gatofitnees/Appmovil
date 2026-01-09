import React, { useState, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';
import MacrosDonutChart from './MacrosDonutChart';

interface MacroRecommendationDisplayProps {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  trainingsPerWeek: number;
  onUpdate?: (values: { calories: number; protein: number; carbs: number; fats: number }) => void;
}

const MacroRecommendationDisplay: React.FC<MacroRecommendationDisplayProps> = ({
  calories,
  protein,
  carbs,
  fats,
  trainingsPerWeek,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({ protein, carbs, fats });

  // Sync props to state when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditValues({ protein, carbs, fats });
    }
  }, [protein, carbs, fats, isEditing]);

  const handleSave = () => {
    const newCals = (editValues.protein * 4) + (editValues.carbs * 4) + (editValues.fats * 9);
    onUpdate?.({ ...editValues, calories: newCals });
    setIsEditing(false);
  };

  const handleChange = (field: keyof typeof editValues, value: string) => {
    const numValue = parseInt(value) || 0;
    setEditValues(prev => ({ ...prev, [field]: numValue }));
  };

  // Calculate calories for display during edit
  const currentDisplayCalories = isEditing
    ? (editValues.protein * 4) + (editValues.carbs * 4) + (editValues.fats * 9)
    : calories;

  return (
    <>
      <div className="bg-secondary/20 border border-white/5 backdrop-blur-sm p-6 rounded-xl mb-6 relative group">
        <div className="flex justify-between items-start mb-3">
          <h2 className="font-bold pr-8">Tus macronutrientes diarios recomendados:</h2>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors absolute top-4 right-4"
          >
            {isEditing ? <Check className="w-5 h-5 text-green-400" /> : <Pencil className="w-4 h-4 text-muted-foreground hover:text-white" />}
          </button>
        </div>

        {/* Macros donut chart */}
        <div className="relative h-52 w-52 mx-auto my-6">
          <MacrosDonutChart
            protein={isEditing ? editValues.protein : protein}
            carbs={isEditing ? editValues.carbs : carbs}
            fats={isEditing ? editValues.fats : fats}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{currentDisplayCalories}</span>
            <span className="text-xs text-muted-foreground">calorías</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            {isEditing ? (
              <input
                type="number"
                value={editValues.protein}
                onChange={(e) => handleChange('protein', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-1 py-0.5 text-center font-semibold text-[#dd6969]"
              />
            ) : (
              <p className="font-semibold text-[#dd6969]">{protein}g</p>
            )}
            <p className="text-xs mt-1">Proteínas</p>
          </div>
          <div>
            {isEditing ? (
              <input
                type="number"
                value={editValues.carbs}
                onChange={(e) => handleChange('carbs', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-1 py-0.5 text-center font-semibold text-[#EB9F6D]"
              />
            ) : (
              <p className="font-semibold text-[#EB9F6D]">{carbs}g</p>
            )}
            <p className="text-xs mt-1">Carbos</p>
          </div>
          <div>
            {isEditing ? (
              <input
                type="number"
                value={editValues.fats}
                onChange={(e) => handleChange('fats', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-1 py-0.5 text-center font-semibold text-[#6C95DC]"
              />
            ) : (
              <p className="font-semibold text-[#6C95DC]">{fats}g</p>
            )}
            <p className="text-xs mt-1">Grasas</p>
          </div>
        </div>
      </div>

      <div className="bg-secondary/20 border border-white/5 backdrop-blur-sm p-6 rounded-xl">
        <h2 className="font-bold mb-2">Recomendación de entrenamiento:</h2>
        <p className="text-sm">
          Te recomendamos comenzar con {trainingsPerWeek} sesiones de entrenamiento
          de intensidad moderada-alta por semana.
        </p>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        {isEditing
          ? "Ajusta tus macros. Las calorías se recalcularán automáticamente."
          : "Estos son valores iniciales. Gatofit los refinará a medida que aprendamos más de ti."}
      </p>
    </>
  );
};

export default MacroRecommendationDisplay;
