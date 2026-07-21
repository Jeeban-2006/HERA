'use client';

import { Moon, Zap, Activity, Droplets } from 'lucide-react';
import { SliderInput } from '@/components/ui/SliderInput';
import type { LifestyleData } from '@/types/pcod.types';

interface LifestyleFormProps {
  data: LifestyleData;
  onChange: (data: LifestyleData) => void;
}

export function LifestyleForm({ data, onChange }: LifestyleFormProps) {
  const update = (key: keyof LifestyleData) => (value: number) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="space-y-6">
      <SliderInput
        label="Sleep Duration"
        icon={Moon}
        value={data.sleep}
        min={3}
        max={12}
        unit="hrs"
        accentColor="#00FFD1"
        onChange={update('sleep')}
      />
      <SliderInput
        label="Stress Level"
        icon={Zap}
        value={data.stress}
        min={1}
        max={10}
        unit="/ 10"
        accentColor="#00FFD1"
        onChange={update('stress')}
      />
      <SliderInput
        label="Exercise Days"
        icon={Activity}
        value={data.exercise}
        min={0}
        max={7}
        unit="days/wk"
        accentColor="#00FFD1"
        onChange={update('exercise')}
      />
      <SliderInput
        label="Water Intake"
        icon={Droplets}
        value={data.water}
        min={0}
        max={15}
        unit="glasses"
        accentColor="#00FFD1"
        onChange={update('water')}
      />
    </div>
  );
}
