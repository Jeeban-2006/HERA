import { createAPIClient } from './client';

const apiClient = createAPIClient();

export interface Route {
  id: string;
  name: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  distance: number;
  eta: number;
}

export interface RouteComparisonResponse {
  safeRoute: Route & { safetyScore: number };
  fastRoute: Route;
  safetySignals: string[];
  heatmapData: any;
}

export interface SOSRequest {
  location: { lat: number; lng: number };
  contacts: string[];
}

export const safetyAPI = {
  calculateRoute: async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteComparisonResponse> => {
    const { data } = await apiClient.post<RouteComparisonResponse>('/api/safety/route', {
      origin,
      destination,
    });
    return data;
  },

  getSavedRoutes: async (): Promise<Route[]> => {
    const { data } = await apiClient.get<Route[]>('/api/safety/routes/saved');
    return data;
  },

  triggerSOS: async (input: SOSRequest): Promise<void> => {
    await apiClient.post('/api/safety/sos', input);
  },
};
