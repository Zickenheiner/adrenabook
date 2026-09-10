import { Check, X } from 'lucide-react';
import { cn } from '@/core/utils/cn';
import { PASSWORD_RULES } from '../../domain/schemas/register.schema';

interface Props {
  password: string;
}

interface Rule {
  label: string;
  check: (value: string) => boolean;
}

const rules: Rule[] = [
  {
    label: `Au moins ${PASSWORD_RULES.minLength} caractères`,
    check: (value) => value.length >= PASSWORD_RULES.minLength,
  },
  {
    label: 'Une lettre majuscule',
    check: PASSWORD_RULES.hasUppercase,
  },
  {
    label: 'Un chiffre',
    check: PASSWORD_RULES.hasDigit,
  },
  {
    label: 'Un caractère spécial',
    check: PASSWORD_RULES.hasSpecialChar,
  },
];

export default function PasswordStrengthIndicator({ password }: Props) {
  const satisfied = rules.filter((rule) => rule.check(password)).length;
  const total = rules.length;
  const ratio = total === 0 ? 0 : satisfied / total;

  const strengthLabel =
    ratio === 0
      ? 'Très faible'
      : ratio < 0.5
        ? 'Faible'
        : ratio < 1
          ? 'Moyen'
          : 'Fort';

  const strengthColor =
    ratio === 0
      ? 'bg-muted'
      : ratio < 0.5
        ? 'bg-destructive'
        : ratio < 1
          ? 'bg-yellow-500'
          : 'bg-green-500';

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Force du mot de passe</span>
        <span className="font-medium">{strengthLabel}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full transition-all duration-300', strengthColor)}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <ul className="space-y-1 text-xs">
        {rules.map((rule) => {
          const ok = rule.check(password);
          return (
            <li
              key={rule.label}
              className={cn(
                'flex items-center gap-2 transition-colors',
                ok ? 'text-green-600' : 'text-muted-foreground',
              )}
            >
              {ok ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
