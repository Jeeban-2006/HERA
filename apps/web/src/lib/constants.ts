export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const PCOD_SYMPTOMS = [
  'Irregular periods',
  'Weight gain',
  'Acne',
  'Hair loss',
  'Fatigue',
  'Mood swings',
  'Bloating',
  'Facial hair',
];

export const MOOD_STATES = [
  { id: 'radiant', label: 'Radiant', color: '#FFD166' },
  { id: 'calm', label: 'Calm', color: '#00FFD1' },
  { id: 'tired', label: 'Tired', color: '#9B5DE5' },
  { id: 'anxious', label: 'Anxious', color: '#FF5F7E' },
  { id: 'sad', label: 'Sad', color: '#6B7B9E' },
  { id: 'irritable', label: 'Irritable', color: '#FF5F7E' },
  { id: 'focused', label: 'Focused', color: '#00FFD1' },
  { id: 'energized', label: 'Energized', color: '#FFD166' },
];

export const CYCLE_PHASES = [
  { id: 'menstrual', label: 'Menstrual', color: '#FF5F7E', emoji: '🔴' },
  { id: 'follicular', label: 'Follicular', color: '#00FFD1', emoji: '🟢' },
  { id: 'ovulation', label: 'Ovulation', color: '#FFD166', emoji: '🟡' },
  { id: 'luteal', label: 'Luteal', color: '#9B5DE5', emoji: '🟣' },
];

export const SAFETY_SIGNALS = [
  { icon: '🏪', label: 'Lit Commercial Areas' },
  { icon: '👮', label: 'Police Station Nearby' },
  { icon: '👥', label: 'High Foot Traffic' },
  { icon: '📷', label: 'CCTV Coverage' },
];

export const HEALTH_GOALS = [
  'Weight management',
  'Fertility planning',
  'Symptom relief',
  'Cycle tracking',
  'Hormonal balance',
  'Mental health',
];

export const PAGE_TITLES = {
  HOME: 'HERA - Women\'s Health Platform',
  LOGIN: 'Sign In - HERA',
  REGISTER: 'Create Account - HERA',
  DASHBOARD: 'Dashboard - HERA',
  PCOD: 'PCOD Analyzer - HERA',
  MOOD: 'Mood Tracker - HERA',
  SAFETY: 'Safety Routes - HERA',
  ARCHITECTURE: 'System Architecture - HERA',
  PROFILE: 'Profile - HERA',
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  PCOD: {
    ANALYZE: '/api/pcod/analyze',
    HISTORY: '/api/pcod/history',
  },
  MOOD: {
    LOG: '/api/mood/log',
    LOGS: '/api/mood/logs',
    CORRELATION: '/api/mood/correlation',
  },
  SAFETY: {
    ROUTE: '/api/safety/route',
    SAVED: '/api/safety/routes/saved',
    SOS: '/api/safety/sos',
  },
};

export const TOAST_DURATION = 4000;

export const DEBOUNCE_DELAY = 300;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  BASE: 300,
  SLOW: 500,
  VERY_SLOW: 800,
};
