import { useEffect, useState } from 'react';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { cn } from '@/core/utils/cn';
import {
  DEFAULT_PATTERN,
  WEEKDAYS,
  addMinutes,
  buildRrule,
  describeRrule,
  parseRrule,
  type RecurrencePattern,
} from '../../domain/utils/rrule';

interface Props {
  value: string;
  onChange: (rrule: string) => void;
  /**
   * Duree definie sur l'activite. Elle fait autorite : l'heure de fin en
   * decoule et n'est pas modifiable ici, pour qu'un creneau ne puisse pas
   * contredire la fiche activite.
   */
  durationMinutes: number;
}

/**
 * Compose la RRULE hebdomadaire envoyee a l'API a partir des jours retenus et
 * de l'heure de debut. La chaine RFC 5545 n'est jamais exposee.
 */
export default function RecurrenceBuilder({
  value,
  onChange,
  durationMinutes,
}: Props) {
  const [pattern, setPattern] = useState<RecurrencePattern>(
    () => parseRrule(value) ?? DEFAULT_PATTERN,
  );

  // Le champ du formulaire est la source de verite : on l'alimente des que le
  // selecteur change, y compris au premier rendu.
  useEffect(() => {
    const next = buildRrule(pattern);
    if (next !== value) onChange(next);
  }, [pattern, value, onChange]);

  const endTime = addMinutes(pattern.time, durationMinutes);

  const toggleWeekday = (day: string) =>
    setPattern((current) => {
      const selected = current.weekdays.includes(day);
      // Au moins un jour doit rester actif : sans BYDAY, la regle retombe sur
      // le jour de la requete.
      if (selected && current.weekdays.length === 1) return current;
      return {
        ...current,
        weekdays: selected
          ? current.weekdays.filter((d) => d !== day)
          : [...current.weekdays, day],
      };
    });

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Jours</Label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const active = pattern.weekdays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleWeekday(day.value)}
                aria-pressed={active}
                className={cn(
                  'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted/50',
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="recurrence-start"
            className="text-xs text-muted-foreground"
          >
            Heure de début
          </Label>
          <Input
            id="recurrence-start"
            type="time"
            value={pattern.time}
            onChange={(e) =>
              setPattern((current) => ({
                ...current,
                time: e.target.value || DEFAULT_PATTERN.time,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="recurrence-end"
            className="text-xs text-muted-foreground"
          >
            Heure de fin
          </Label>
          <Input
            id="recurrence-end"
            type="time"
            value={endTime}
            readOnly
            disabled
            className="cursor-not-allowed"
          />
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-sm">
          <span className="text-muted-foreground">Récapitulatif : </span>
          {describeRrule(pattern)} ({durationMinutes} min)
        </p>
      </div>
    </div>
  );
}
