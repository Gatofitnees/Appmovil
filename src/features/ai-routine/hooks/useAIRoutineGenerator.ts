import { useState } from 'react';
import { RoutineExercise } from '@/features/workout/types';
import { useAuth } from '@/contexts/AuthContext';

interface AIRoutineResponse {
    routine_name: string;
    description: string;
    exercises: {
        name: string;
        id?: number;
        exercise_id?: number;
        sets: number;
        reps_range: string;
        rest_seconds?: number;
        notes?: string;
    }[];
}

interface GenerateParams {
    type: string;
    goal: string;
    days: string;
    experience: string;
    focus_muscles: string[];
    chatContext?: string;
}

export const useAIRoutineGenerator = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const generateRoutine = async (params: GenerateParams): Promise<{ exercises: RoutineExercise[], name: string, description: string } | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('https://n8n.gatofit.com/webhook/rutina-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    preferences: params,
                    user_id: user?.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Error connecting to AI service');
            }

            const rawData: any = await response.json();

            // Normalize data: handle Array wrapper, then 'output' property wrapper
            let dataToProcess = rawData;

            // 1. Unwrap Array if it's an array (N8N often returns [{...}])
            if (Array.isArray(rawData) && rawData.length > 0) {
                dataToProcess = rawData[0];
            }

            // 2. Unwrap "output" property if present
            let data: AIRoutineResponse = dataToProcess;
            if (dataToProcess && dataToProcess.output && typeof dataToProcess.output === 'object') {
                data = dataToProcess.output;
            }

            if (!data || !data.exercises || !Array.isArray(data.exercises)) {
                console.error("AI Response Format Invalid:", rawData);
                throw new Error('Invalid response format from AI');
            }

            const mappedExercises: RoutineExercise[] = data.exercises.map((ex, index) => ({
                id: Date.now() + index, // Ideally use ex.exercise_id if available, but fallback to temp ID
                // Use exercise_id from AI if valid, otherwise check if 'id' is a valid DB ID (not timestamp)
                exercise_id: ex.exercise_id || (ex.id && ex.id < 2147483647 ? ex.id : undefined),
                name: ex.name,
                muscle_group_main: 'General',
                sets: Array(ex.sets).fill({
                    reps_min: parseInt(ex.reps_range.split('-')[0]) || 8,
                    reps_max: parseInt(ex.reps_range.split('-')[1]) || 12,
                    rest_seconds: ex.rest_seconds || 60
                }),
                notes: ex.notes,
                difficulty_level: 'intermediate'
            }));

            console.log('🔍 AI Response exercises:', JSON.stringify(data.exercises.map(e => ({
                name: e.name,
                exercise_id: e.exercise_id
            })), null, 2));
            console.log('🔍 Mapped exercises:', JSON.stringify(mappedExercises.map(e => ({
                name: e.name,
                id: e.id,
                exercise_id: e.exercise_id
            })), null, 2));

            return {
                exercises: mappedExercises,
                name: data.routine_name,
                description: data.description
            };

        } catch (err) {
            console.error("AI Generation Error:", err);
            setError('No se pudo generar la rutina. Inténtalo de nuevo.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        generateRoutine,
        isLoading,
        error
    };
};
