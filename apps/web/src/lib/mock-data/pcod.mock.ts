import type { PCODAnalysisResult } from '@/types/pcod.types';

export const SYMPTOMS_LIST: string[] = [
  'Irregular periods', 'Weight gain', 'Acne', 'Hair thinning',
  'Excess facial hair', 'Fatigue', 'Mood swings', 'Bloating',
  'Pelvic pain', 'Heavy periods', 'Absent periods', 'Cravings',
  'Brain fog', 'Sleep issues', 'Low libido', 'Skin darkening',
];

export const MOCK_PCOD_RESULT: PCODAnalysisResult = {
  subtype: 'insulin_resistant',
  subtypeLabel: 'Insulin-Resistant PCOD',
  riskScore: 72,
  confidence: 84,
  drivers: [
    { label: 'Insulin Resistance', value: 78, color: '#FF5F7E' },
    { label: 'Inflammation', value: 45, color: '#FFD166' },
    { label: 'Adrenal Activity', value: 32, color: '#9B5DE5' },
    { label: 'Lifestyle Impact', value: 61, color: '#00FFD1' },
  ],
  recommendations: [
    { category: 'Diet', title: 'Low-GI Nutrition Plan', desc: 'Reduce refined carbs and sugar. Focus on complex carbs, lean protein, and healthy fats to improve insulin sensitivity.', priority: 'high', iconName: 'Salad' },
    { category: 'Exercise', title: 'Resistance Training', desc: '3–4x per week strength training significantly improves insulin receptor sensitivity and reduces androgen levels.', priority: 'high', iconName: 'Dumbbell' },
    { category: 'Sleep', title: 'Optimise Sleep Quality', desc: 'Aim for 7–9 hours. Poor sleep elevates cortisol which worsens insulin resistance.', priority: 'medium', iconName: 'Moon' },
    { category: 'Supplement', title: 'Inositol + Berberine', desc: 'Myo-inositol (4g/day) and berberine (500mg 3x/day) clinically shown to improve insulin sensitivity in PCOD.', priority: 'medium', iconName: 'Pill' },
    { category: 'Stress', title: 'Cortisol Management', desc: 'Daily mindfulness, yoga, or breathwork. Chronic stress elevates cortisol which directly worsens androgen levels.', priority: 'low', iconName: 'Heart' },
  ],
  labFlags: [
    { marker: 'Fasting Insulin', value: '18.4 µIU/mL', status: 'high', range: '2–10 µIU/mL' },
    { marker: 'Testosterone (Free)', value: '4.2 pg/mL', status: 'borderline', range: '0.3–3.8 pg/mL' },
    { marker: 'LH/FSH Ratio', value: '2.8', status: 'high', range: '< 2.0' },
    { marker: 'AMH', value: '8.1 ng/mL', status: 'high', range: '1.0–3.5 ng/mL' },
    { marker: 'Fasting Glucose', value: '92 mg/dL', status: 'normal', range: '70–99 mg/dL' },
  ],
};
