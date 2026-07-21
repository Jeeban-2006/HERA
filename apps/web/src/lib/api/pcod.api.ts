import apiClient from "./client";
import { transformPCODResponse } from "./transformers";
import { PCODAnalysisResult } from "@/types/pcod.types";

export const pcodApi = {
  analyzePCOD: async (payload: any): Promise<PCODAnalysisResult> => {
    const res = await apiClient.post("/pcod/analyze", payload);
    return transformPCODResponse(res.data);
  },
  getPCODHistory: async (page = 1, limit = 20) => {
    const res = await apiClient.get(`/pcod/history?page=${page}&limit=${limit}`);
    return res.data; // You can add a transformer for history if needed
  }
};
