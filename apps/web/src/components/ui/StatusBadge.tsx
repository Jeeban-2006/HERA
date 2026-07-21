import { cn } from '@/lib/cn';
import type { LabStatus } from '@/types/pcod.types';

const statusConfig: Record<LabStatus, { label: string; classes: string }> = {
  normal: { label: 'Normal', classes: 'bg-bio-teal/10 text-bio-teal border-bio-teal/30' },
  borderline: { label: 'Borderline', classes: 'bg-bio-gold/10 text-bio-gold border-bio-gold/30' },
  high: { label: 'High', classes: 'bg-bio-coral/10 text-bio-coral border-bio-coral/30' },
  low: { label: 'Low', classes: 'bg-bio-violet/10 text-bio-violet border-bio-violet/30' },
};

interface StatusBadgeProps {
  status: LabStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
