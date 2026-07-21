import apiClient from "./client";
import { transformCorrelationResponse } from "./transformers";
import { MoodLogRequest, CorrelationResult } from "@/types/mood.types";

export const moodApi = {
  logMood: async (payload: MoodLogRequest) => {
    const res = await apiClient.post("/mood/log", payload);
    return res.data;
  },
  getCorrelation: async (days: number = 30): Promise<CorrelationResult | { error: "insufficient_data", logs_available: number }> => {
    const res = await apiClient.get(`/mood/correlation?days=${days}`);
    if (res.data?.error === "insufficient_data") {
      return { error: "insufficient_data", logs_available: res.data.logs_available || 0 };
    }
    return transformCorrelationResponse(res.data);
  },
  getMoodLogs: async (startDate?: string, endDate?: string) => {
    let url = "/mood/logs?";
    if (startDate) url += `start_date=${startDate}&`;
    if (endDate) url += `end_date=${endDate}`;
    const res = await apiClient.get(url);
    return res.data;
  }
};
