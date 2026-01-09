import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutExercise } from '../types/workout';
import { useAuth } from '@/contexts/AuthContext';

export interface PerformanceStats {
    score: number;
    improvedCount: number;
    worsenedCount: number;
    maintainedCount: number;
    feedbackTitle: string;
    feedbackSubtitle: string;
    totalVolume: number;
}

export function useWorkoutPerformance() {
    const { user } = useAuth();
    const [isCalculating, setIsCalculating] = useState(false);

    const calculatePerformance = async (exercises: WorkoutExercise[], currentLogId?: number): Promise<PerformanceStats | null> => {
        if (!user || exercises.length === 0) return null;

        setIsCalculating(true);
        try {
            let improvedCount = 0;
            let worsenedCount = 0;
            let maintainedCount = 0;
            let validComparisonCount = 0;
            let totalVolume = 0;

            // Extract unique exercise IDs to fetch history efficiently
            const exerciseIds = exercises.map(ex => ex.id);

            // Fetch last 10 logs for these exercises (to ensure we get last 4 complete sessions per exercise)
            // Note: This is a simplified fetch. Ideally we'd group by exercise_id, but simple IN query is faster.
            let query = supabase
                .from('workout_log_exercise_details')
                .select(`
          exercise_id,
          weight_kg_used,
          workout_logs!inner (
            workout_date,
            user_id,
            id
          )
        `)
                .eq('workout_logs.user_id', user.id)
                .in('exercise_id', exerciseIds)
                .order('workout_date', { foreignTable: 'workout_logs', ascending: false })
                .limit(exerciseIds.length * 5); // Fetch enough to cover ~4-5 previous sessions per exercise

            if (currentLogId) {
                // Important: Exclude the current log we just saved, otherwise we compare against itself!
                query = query.neq('workout_log_id', currentLogId);
            }

            const { data: historyData, error } = await query;

            if (error) throw error;

            // Group history by exercise ID -> Session (Workout Log ID/Date) -> Max Weight
            // Structure: { [exerciseId]: { [date]: maxWeightInSession } }
            const historyByExerciseSession: Record<number, Record<string, number>> = {};

            historyData?.forEach((log: any) => {
                if (!log.weight_kg_used || !log.workout_logs?.workout_date) return;

                const exId = log.exercise_id;
                const date = log.workout_logs.workout_date;
                const weight = log.weight_kg_used;

                if (!historyByExerciseSession[exId]) {
                    historyByExerciseSession[exId] = {};
                }

                // Track max weight for that session
                if (!historyByExerciseSession[exId][date] || weight > historyByExerciseSession[exId][date]) {
                    historyByExerciseSession[exId][date] = weight;
                }
            });

            for (const exercise of exercises) {
                // Calculate current max weight for this session
                const currentWeights = exercise.sets
                    .map(s => (typeof s.weight === 'string' ? parseFloat(s.weight) : s.weight))
                    .filter((w): w is number => w !== null && !isNaN(w) && w > 0);

                // Calculate Volume
                exercise.sets.forEach(set => {
                    const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight || 0;
                    const reps = typeof set.reps === 'string' ? parseFloat(set.reps) : set.reps || 0;
                    if (weight > 0 && reps > 0) {
                        totalVolume += weight * reps;
                    }
                });

                if (currentWeights.length === 0) continue;

                const currentMax = Math.max(...currentWeights);
                validComparisonCount++;

                // Get history for this exercise specific sessions
                const sessionHistoryMap = historyByExerciseSession[exercise.id] || {};
                // Sort dates desc (newest first)
                const sortedDates = Object.keys(sessionHistoryMap).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

                if (sortedDates.length === 0) {
                    // No history -> New exercise or first time logged correctly
                    // Count as improvement to encourage user
                    improvedCount++;
                    continue;
                }

                // Comparison Logic
                const lastSessionDate = sortedDates[0];
                const lastSessionMax = sessionHistoryMap[lastSessionDate];

                // Historical Average (Last 4 sessions, including the last one)
                // Use slice(0, 5) to capture a broader recent context if available, but weights last session heavily implicitly
                const recentSessionMaxes = sortedDates.slice(0, 5).map(d => sessionHistoryMap[d]);
                const historicalAverage = recentSessionMaxes.reduce((a, b) => a + b, 0) / recentSessionMaxes.length;

                // Thresholds (small buffer to avoid noise)
                const lastSessionThreshold = 0.0; // Strict comparison vs last time for "improvement"
                const avgThreshold = historicalAverage * 0.02; // 2% buffer for average

                const betterThanLast = currentMax > lastSessionMax;
                const worseThanLast = currentMax < lastSessionMax;
                const betterThanAvg = currentMax > (historicalAverage + avgThreshold);
                const worseThanAvg = currentMax < (historicalAverage - avgThreshold);

                // Scoring Logic Rules:
                // Prioritize "Last Session" status.
                if (betterThanLast) {
                    improvedCount++;
                } else if (worseThanLast) {
                    worsenedCount++;
                } else {
                    maintainedCount++;
                }
                // We could use betterThanAvg for nuanced "yellow" status later if needed, but for counts, we stick to strict progress.
            }

            // Calculate finalized score (0-100)
            const totalEvaluated = validComparisonCount > 0 ? validComparisonCount : exercises.length;

            // Base score calculation
            let rawScore = 70;
            if (validComparisonCount > 0) {
                // Improvements are worth more (+25)
                rawScore += (improvedCount / validComparisonCount) * 30;
                // Drops are penalized (-20)
                rawScore -= (worsenedCount / validComparisonCount) * 20;
                // Add maintain bonus (+5)
                rawScore += (maintainedCount / validComparisonCount) * 5;
            } else {
                rawScore = 100; // First workout is always perfect start
            }

            const score = Math.min(100, Math.max(50, Math.round(rawScore)));

            // Generate Nuanced Feedback Text
            let feedbackTitle = "¡Bien hecho!";
            let feedbackSubtitle = "Has completado tu entrenamiento.";

            if (score >= 90) {
                feedbackTitle = "¡Imparable!";
                feedbackSubtitle = "Has superado tus marcas en la mayoría de ejercicios.";
            } else if (score >= 80) {
                if (improvedCount >= worsenedCount) {
                    feedbackTitle = "¡Vas mejorando!";
                    feedbackSubtitle = "Estás superando tu última sesión. ¡Sigue así!";
                } else {
                    feedbackTitle = "Buen trabajo";
                    feedbackSubtitle = "Mantienes un buen nivel global, aunque hoy costó un poco más.";
                }
            } else if (score >= 60) {
                if (worsenedCount > improvedCount) {
                    // Nuanced: Worse than last, but maybe ok average?
                    feedbackTitle = "Día difícil, pero...";
                    feedbackSubtitle = improvedCount > 0
                        ? `Bajaste en algunos, pero mejoraste en ${improvedCount}. ¡El progreso no es lineal!`
                        : "Hoy fue un reto. Lo importante es que cumpliste y sumaste volumen.";
                } else {
                    feedbackTitle = "Entrenamiento Sólido";
                    feedbackSubtitle = "Mantienes tus números estables. La constancia es la clave.";
                }
            } else {
                feedbackTitle = "¿Día pesado?";
                feedbackSubtitle = "Tu rendimiento bajó respecto a la última vez. ¡Descansa y vuelve con todo!";
            }

            return {
                score,
                improvedCount,
                worsenedCount,
                maintainedCount,
                feedbackTitle,
                feedbackSubtitle,
                totalVolume: Math.round(totalVolume)
            };

        } catch (error) {
            console.error("Error calculating performance:", error);
            return null;
        } finally {
            setIsCalculating(false);
        }
    };

    return { calculatePerformance, isCalculating };
}
