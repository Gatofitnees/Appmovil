
import React from "react";
import { ExerciseSession } from "@/hooks/types/exerciseHistory";

interface SessionStatsProps {
  session: ExerciseSession;
}

export const SessionStats: React.FC<SessionStatsProps> = ({ session }) => {
  // Flatten all sets from all workouts in this session
  // This handles the case where users might have created multiple "workouts" for single sets
  const allSets = session.workouts.flatMap(workout => workout.sets);

  return (
    <div className="space-y-4">
      {/* Daily Summary */}
      <div className="bg-background/40 rounded-lg border border-white/10 p-4">
        <h5 className="text-sm font-medium mb-3 text-primary">Resumen del día</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Peso máximo:</span>
            <span className="font-medium text-primary">
              {session.dailyMaxWeight ? `${session.dailyMaxWeight} kg` : '-'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total repeticiones:</span>
            <span className="font-medium text-primary">{session.dailyTotalReps}</span>
          </div>
        </div>
      </div>

      {/* Flattened Sets List */}
      <div className="bg-background/40 rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Serie</th>
              <th className="px-4 py-3 font-medium text-center">Peso</th>
              <th className="px-4 py-3 font-medium text-right">Reps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {allSets.map((set, index) => (
              <tr key={`${set.set_number}-${index}`} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-center">
                  {set.weight_kg_used ? (
                    <span className="font-bold text-primary">{set.weight_kg_used} kg</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-medium">{set.reps_completed || 0}</span>
                </td>
              </tr>
            ))}
            {allSets.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                  No hay series registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
