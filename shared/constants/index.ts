export const API_TIMEOUT_MS = 30000;
export const CACHE_TTL_SECONDS = 3600;
export const MAX_RETRIES = 3;

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum MoodType {
  ANXIOUS = 'anxious',
  HAPPY = 'happy',
  NEUTRAL = 'neutral',
  SAD = 'sad',
  ANGRY = 'angry',
}

export const PCOD_RISK_THRESHOLDS = {
  low: { min: 0, max: 0.33 },
  medium: { min: 0.33, max: 0.66 },
  high: { min: 0.66, max: 1.0 },
};

export const MOOD_SCALE_MIN = 1;
export const MOOD_SCALE_MAX = 10;

export const SERVICE_PORTS = {
  API_GATEWAY: 8000,
  PCOD_SERVICE: 8001,
  MOOD_SERVICE: 8002,
  SAFETY_SERVICE: 8003,
  FRONTEND: 3000,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
