import { useMutation, useQuery } from "@tanstack/react-query";
import { pcodApi } from "../lib/api/pcod.api";

export function useAnalyzePCOD() {
  return useMutation({
    mutationFn: pcodApi.analyzePCOD,
  });
}

export function usePCODHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["pcod-history", page, limit],
    queryFn: () => pcodApi.getPCODHistory(page, limit),
  });
}
