import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRoutines } from './useRoutines';
import { useActiveProgramUnified } from './useActiveProgramUnified';
import { fetchRoutineDetailsById } from '@/features/workout/hooks/useRoutineDetail';
import { fetchPreviousData } from '@/features/workout/hooks/usePreviousData';

export const useGlobalPrefetch = () => {
    const queryClient = useQueryClient();
    const { routines } = useRoutines();
    // Using today's date for active program prefetch
    const { activeProgram } = useActiveProgramUnified(new Date());

    useEffect(() => {
        const prefetchData = async () => {
            const routineIdsToPrefetch = new Set<number>();

            // 1. Prefetch today's scheduled routines (highest priority)
            if (activeProgram?.routines) {
                activeProgram.routines.forEach((r: any) => {
                    if (r.routine_id) {
                        routineIdsToPrefetch.add(r.routine_id);
                    }
                });
            }

            // 2. Prefetch the first 3 user routines
            if (routines && routines.length > 0) {
                routines.slice(0, 3).forEach(r => {
                    routineIdsToPrefetch.add(r.id);
                });
            }

            // Execute prefetch for gathered IDs
            for (const id of routineIdsToPrefetch) {
                try {
                    // Check if it's already in cache to avoid unnecessary fetches
                    const existingRoutineData = queryClient.getQueryData(['routine', id]);

                    let routineDetails: any = null;

                    if (!existingRoutineData) {
                        // Prefetch routine details
                        await queryClient.prefetchQuery({
                            queryKey: ['routine', id],
                            queryFn: () => fetchRoutineDetailsById(id),
                            staleTime: 5 * 60 * 1000,
                        });
                        routineDetails = queryClient.getQueryData(['routine', id]);
                    } else {
                        routineDetails = existingRoutineData;
                    }

                    // Prefetch previous exercise history for those exercises
                    if (routineDetails?.exercises && routineDetails.exercises.length > 0) {
                        const exerciseDetails = routineDetails.exercises;
                        const exerciseIds = exerciseDetails.map((ex: any) => ex.id).sort().join(',');

                        await queryClient.prefetchQuery({
                            queryKey: ['previous_exercise_data', exerciseIds],
                            queryFn: () => fetchPreviousData(exerciseDetails),
                            staleTime: 5 * 60 * 1000,
                        });
                    }
                } catch (error) {
                    console.error(`Error prefetching data for routine ${id}:`, error);
                }
            }
        };

        // Run off the main thread slightly to not block initial render
        const timeoutId = setTimeout(() => {
            prefetchData();
        }, 1500);

        return () => clearTimeout(timeoutId);
    }, [routines, activeProgram, queryClient]);
};
