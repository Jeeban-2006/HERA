import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moodApi } from "../lib/api/mood.api";
import { MoodLogRequest } from "@/types/mood.types";

export function useLogMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MoodLogRequest) => moodApi.logMood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-correlation"] });
      queryClient.invalidateQueries({ queryKey: ["mood-logs"] });
    },
  });
}

export function useMoodCorrelation(days: number = 30) {
  return useQuery({
    queryKey: ["mood-correlation", days],
    queryFn: () => moodApi.getCorrelation(days),
    retry: false, // Do not retry if we get 4xx or 5xx, handle the error gracefully
  });
}

export function useMoodLogs(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["mood-logs", startDate, endDate],
    queryFn: () => moodApi.getMoodLogs(startDate, endDate),
  });
}
