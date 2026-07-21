import { createAPIClient } from './client';
import { PCODPrediction } from '@shared/types';

const apiClient = createAPIClient();

export interface PCODAnalysisRequest {
  symptoms: string[];
  sleep: number;
  stress: number;
  exercise: number;
  waterIntake: number;
  insulin?: number;
  testosterone?: number;
  lhFshRatio?: number;
  amh?: number;
}

export interface PCODAnalysisResponse extends PCODPrediction {
  subtype: string;
  recommendations: string[];
}

export const pcodAPI = {
  analyze: async (input: PCODAnalysisRequest): Promise<PCODAnalysisResponse> => {
    const { data } = await apiClient.post<PCODAnalysisResponse>('/api/pcod/analyze', input);
    return data;
  },

  getHistory: async (): Promise<PCODAnalysisResponse[]> => {
    const { data } = await apiClient.get<PCODAnalysisResponse[]>('/api/pcod/history');
    return data;
  },

  deleteAnalysis: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/pcod/history/${id}`);
  },
};
