
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/features/workout/types';

const PAGE_SIZE = 10;

const fetchExercises = async ({ pageParam = 0, queryKey }: any) => {
  const [_key, { searchTerm, muscleFilters, equipmentFilters }] = queryKey;

  // Get total count of all exercises
  let countQuery = supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });

  const { count: totalCount } = await countQuery;

  // Get filtered exercises
  let query = supabase
    .from('exercises')
    .select('*');

  if (searchTerm) {
    const searchCondition = `name.ilike.%${searchTerm}%,muscle_group_main.ilike.%${searchTerm}%`;
    query = query.or(searchCondition);
  }

  if (muscleFilters && muscleFilters.length > 0) {
    const muscleFilterString = muscleFilters.map((m: string) => `muscle_group_main.ilike.%${m}%`).join(',');
    query = query.or(muscleFilterString);
  }

  if (equipmentFilters && equipmentFilters.length > 0) {
    const equipmentFilterString = equipmentFilters.map((e: string) => `equipment_required.ilike.%${e}%`).join(',');
    query = query.or(equipmentFilterString);
  }

  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  query = query.range(from, to).order('name', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }

  return {
    data: data as Exercise[],
    nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined,
    totalCount: totalCount ?? 0,
  };
};

export const usePaginatedExercises = (filters: { searchTerm: string, muscleFilters: string[], equipmentFilters: string[] }) => {
  return useInfiniteQuery({
    queryKey: ['paginatedExercises', filters],
    queryFn: fetchExercises,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};
