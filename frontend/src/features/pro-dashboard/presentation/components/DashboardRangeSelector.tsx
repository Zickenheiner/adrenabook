import { cn } from '@/core/utils/cn';
import type { DashboardQueryDto } from '../../data/dtos/dashboard.dto';

type Range = DashboardQueryDto['range'];

const RANGES: { value: Range; label: string }[] = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Année' },
];

interface Props {
  value: Range;
  onChange: (range: Range) => void;
}

export default function DashboardRangeSelector({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-muted p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
            value === r.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
