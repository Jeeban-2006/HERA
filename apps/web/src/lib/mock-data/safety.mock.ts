import type { RouteResult, EmergencyContact } from '@/types/safety.types';

export const MOCK_ROUTE_RESULT: RouteResult = {
  safestRoute: {
    type: 'safest',
    distance: '4.1 km',
    duration: '15 min',
    safetyScore: 8.4,
    coordinates: [
      [72.8347, 19.0544],[72.8360, 19.0620],[72.8390, 19.0700],
      [72.8420, 19.0780],[72.8450, 19.0860],[72.8479, 19.1136],
    ],
    signals: [
      { type: 'police', description: 'Police station within 200m', iconName: 'ShieldCheck', positive: true },
      { type: 'lighting', description: 'Well-lit commercial area', iconName: 'Sun', positive: true },
      { type: 'foot_traffic', description: 'High foot traffic till 11pm', iconName: 'Users', positive: true },
      { type: 'cctv', description: 'CCTV coverage detected', iconName: 'Camera', positive: true },
    ],
  },
  fastestRoute: {
    type: 'fastest',
    distance: '2.8 km',
    duration: '10 min',
    safetyScore: 4.1,
    coordinates: [
      [72.8347, 19.0544],[72.8370, 19.0650],[72.8400, 19.0750],
      [72.8430, 19.0900],[72.8479, 19.1136],
    ],
    signals: [
      { type: 'lighting', description: 'Poor street lighting', iconName: 'Moon', positive: false },
      { type: 'isolation', description: 'Isolated stretch after 9pm', iconName: 'AlertTriangle', positive: false },
      { type: 'facilities', description: 'No public facilities nearby', iconName: 'X', positive: false },
    ],
  },
};

export const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: '1', name: 'Mom', phone: '+91 98765 43210' },
  { id: '2', name: 'Priya (Friend)', phone: '+91 87654 32109' },
];
