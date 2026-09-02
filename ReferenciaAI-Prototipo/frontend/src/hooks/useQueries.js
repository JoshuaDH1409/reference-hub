import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard(),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutos de stale time
  });
}
