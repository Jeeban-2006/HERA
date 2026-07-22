import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { periodApi } from '@/lib/api/period.api';

export function useCurrentCycle() {
  return useQuery({
    queryKey: ['period-current'],
    queryFn: periodApi.getCurrentStatus,
    refetchInterval: 1000 * 60 * 60, // refresh every hour
    retry: false,
  });
}

export function usePeriodHistory() {
  return useQuery({
    queryKey: ['period-history'],
    queryFn: periodApi.getHistory,
    retry: false,
  });
}

export function useStartPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: periodApi.startPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['period-current'] });
      queryClient.invalidateQueries({ queryKey: ['period-history'] });
      queryClient.invalidateQueries({ queryKey: ['mood-correlation'] });
    },
  });
}

export function useEndPeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: periodApi.endPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['period-current'] });
      queryClient.invalidateQueries({ queryKey: ['period-history'] });
    },
  });
}

export function useLogSymptoms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: periodApi.logSymptoms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['period-history'] });
      queryClient.invalidateQueries({ queryKey: ['period-symptoms'] });
    },
  });
}
