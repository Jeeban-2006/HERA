export type RiskLevel = 'low' | 'medium' | 'high';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SafetySignal {
  type: string;
  description: string;
  iconName: string;
  positive: boolean;
}

export interface RouteOption {
  type: 'safest' | 'fastest';
  distance: string;
  duration: string;
  safetyScore: number;
  coordinates: [number, number][];
  signals: SafetySignal[];
}

export interface RouteResult {
  safestRoute: RouteOption;
  fastestRoute: RouteOption;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}
