

import React from "react";
import { ChevronRight, Check } from "lucide-react";
import ExercisePreview from "./ExercisePreview";

interface Exercise {
  id: number;
  name: string;
  muscle_group_main: string;
  equipment_required?: string;
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
}

interface ExerciseItemProps {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onViewDetails: (id: number) => void;
  isAlreadyInRoutine?: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  isSelected,
  onSelect,
  onViewDetails,
  isAlreadyInRoutine = false
}) => {
  return (
    <div
      className={`relative p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all duration-200 overflow-hidden ${isSelected
          ? 'border-sky-500/30 bg-secondary/30 pl-4'
          : 'border-border/50 hover:border-border pl-3'
        } ${isAlreadyInRoutine ? 'opacity-60' : ''
        }`}
      onClick={() => onSelect(exercise.id)}
    >
      {/* Selection Left Bar Indicator */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-200 ${isSelected ? 'bg-sky-500' : 'bg-transparent w-0'
          }`}
      />

      {/* Exercise Preview */}
      <ExercisePreview
        thumbnailUrl={exercise.thumbnail_url}
        videoUrl={exercise.video_url}
        imageUrl={exercise.image_url}
        exerciseName={exercise.name}
      />

      {/* Exercise info */}
      <div className={`flex-1 transition-transform duration-200 ${isSelected ? 'translate-x-1' : ''}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-base text-foreground">
              {exercise.name}
              {isAlreadyInRoutine && (
                <span className="text-xs ml-2 bg-secondary/60 text-secondary-foreground/70 px-2 py-0.5 rounded-full">
                  Ya añadido
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-xs bg-sky-500/10 text-sky-500 px-2 py-0.5 rounded-full">
                {exercise.muscle_group_main}
              </span>
              {exercise.equipment_required && (
                <span className="text-xs bg-secondary/40 text-muted-foreground px-2 py-0.5 rounded-full">
                  {exercise.equipment_required}
                </span>
              )}
            </div>
          </div>

          {/* Details button (replacing check) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(exercise.id);
            }}
            className={`p-1.5 rounded-full hover:bg-muted transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
            aria-label="View exercise details"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseItem;
