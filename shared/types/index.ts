export interface PCODPrediction {
  risk_level: 'low' | 'medium' | 'high';
  confidence: number;
  markers: {
    testosterone: number;
    lh_fsh_ratio: number;
    insulin_resistance: number;
  };
  timestamp: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  hormone_levels: {
    estrogen: number;
    progesterone: number;
    cortisol: number;
  };
  notes: string;
  created_at: string;
}

export interface SafetyAssessment {
  route_id: string;
  safety_score: number;
  risk_factors: string[];
  recommendations: string[];
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
