import { createAPIClient } from './client';
import { MoodEntry } from '@shared/types';

const apiClient = createAPIClient();

export interface MoodLogRequest {
  date: string;
  moodScore: number;
  moodState: string;
  notes?: string;
}

export interface CorrelationData {
  data: MoodEntry[];
  correlations: { phase: string; correlation: number }[];
  pmsDays: string[];
}

export const moodAPI = {
  log: async (input: MoodLogRequest): Promise<MoodEntry> => {
    const { data } = await apiClient.post<MoodEntry>('/api/mood/log', input);
    return data;
  },

  getLogs: async (days: number = 30): Promise<MoodEntry[]> => {
    const { data } = await apiClient.get<MoodEntry[]>(`/api/mood/logs?days=${days}`);
    return data;
  },

  getCorrelation: async (days: number = 30): Promise<CorrelationData> => {
    const { data } = await apiClient.get<CorrelationData>(`/api/mood/correlation?days=${days}`);
    return data;
  },
};
