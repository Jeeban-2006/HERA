export type PCODSubtype = 'insulin_resistant' | 'inflammatory' | 'adrenal' | 'post_pill';
export type LabStatus = 'normal' | 'borderline' | 'high' | 'low';
export type Priority = 'high' | 'medium' | 'low';

export interface LifestyleData {
  sleep: number;
  stress: number;
  exercise: number;
  water: number;
}

export interface LabValues {
  insulin: string;
  testosterone: string;
  lhFsh: string;
  amh: string;
  glucose: string;
}

export interface PCODFormState {
  symptoms: string[];
  lifestyle: LifestyleData;
  labValues: LabValues;
}

export interface DriverBreakdown {
  label: string;
  value: number;
  color: string;
}

export interface Recommendation {
  category: string;
  title: string;
  desc: string;
  priority: Priority;
  iconName: string;
}

export interface LabFlag {
  marker: string;
  value: string;
  status: LabStatus;
  range: string;
}

export interface PCODAnalysisResult {
  subtype: PCODSubtype;
  subtypeLabel: string;
  riskScore: number;
  confidence: number;
  drivers: DriverBreakdown[];
  recommendations: Recommendation[];
  labFlags: LabFlag[];
}
