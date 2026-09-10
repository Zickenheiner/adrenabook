import { Badge } from '@/core/components/ui/badge';
import { cn } from '@/core/utils/cn';

const ACTIVITY_TYPES = [
  { value: '', label: 'Tous' },
  { value: 'escalade', label: 'Escalade' },
  { value: 'parapente', label: 'Parapente' },
  { value: 'plongee', label: 'Plongée' },
  { value: 'saut-elastique', label: 'Élastique' },
  { value: 'canyoning', label: 'Canyoning' },
  { value: 'via-ferrata', label: 'Via Ferrata' },
];

interface Props {
  value: string;
  onChange: (type: string) => void;
}

export default function ActivityTypeFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {ACTIVITY_TYPES.map((type) => (
        <button
          key={type.value}
          onClick={() => onChange(type.value)}
          className="cursor-pointer"
          aria-pressed={value === type.value}
        >
          <Badge
            variant={value === type.value ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-colors hover:bg-primary/10',
              value === type.value &&
                'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {type.label}
          </Badge>
        </button>
      ))}
    </div>
  );
}
