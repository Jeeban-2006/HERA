import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-mono border-2 transition-all duration-300',
                  isCompleted && 'bg-bio-teal border-bio-teal text-void',
                  isActive && 'bg-bio-coral/20 border-bio-coral text-bio-coral shadow-glow-coral',
                  !isCompleted && !isActive && 'bg-white/5 border-white/20 text-text-muted'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span>{idx + 1}</span>}
              </div>
              <span
                className={cn(
                  'text-xs font-body hidden sm:block whitespace-nowrap transition-colors',
                  isActive ? 'text-bio-coral' : isCompleted ? 'text-bio-teal' : 'text-text-muted'
                )}
              >
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mb-5 transition-all duration-500',
                  isCompleted ? 'bg-bio-teal' : 'bg-white/10'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
