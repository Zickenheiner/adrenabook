/**
 * Traduction entre une recurrence decrite par le formulaire et la chaine RRULE
 * (RFC 5545) attendue par l'API.
 *
 * Le formulaire n'expose qu'une recurrence hebdomadaire : c'est le seul rythme
 * utile pour un planning d'activites, et cela evite d'exposer la RFC au
 * professionnel. Les autres frequences restent accessibles en mode avance.
 *
 * Le backend developpe la regle avec la librairie `rrule` sans lui fournir de
 * DTSTART : sans BYHOUR/BYMINUTE, les creneaux heritent de l'heure a laquelle
 * la requete est envoyee. L'heure fait donc partie de la regle generee.
 */

export interface RecurrencePattern {
  /** Jours iCal (MO, TU, ...) retenus pour la recurrence hebdomadaire. */
  weekdays: string[];
  /** Heure de debut au format `HH:MM`. */
  time: string;
}

export const WEEKDAYS = [
  { value: 'MO', label: 'Lun' },
  { value: 'TU', label: 'Mar' },
  { value: 'WE', label: 'Mer' },
  { value: 'TH', label: 'Jeu' },
  { value: 'FR', label: 'Ven' },
  { value: 'SA', label: 'Sam' },
  { value: 'SU', label: 'Dim' },
] as const;

export const DEFAULT_PATTERN: RecurrencePattern = {
  weekdays: ['MO'],
  time: '09:00',
};

const WEEKDAY_VALUES = WEEKDAYS.map((d) => d.value) as readonly string[];

/** Ordonne les jours comme la semaine, quel que soit l'ordre de selection. */
const sortWeekdays = (days: string[]): string[] =>
  [...days].sort(
    (a, b) => WEEKDAY_VALUES.indexOf(a) - WEEKDAY_VALUES.indexOf(b),
  );

export function buildRrule(pattern: RecurrencePattern): string {
  const [hour, minute] = pattern.time.split(':');
  const parts = ['FREQ=WEEKLY'];

  if (pattern.weekdays.length > 0) {
    parts.push(`BYDAY=${sortWeekdays(pattern.weekdays).join(',')}`);
  }
  parts.push(`BYHOUR=${Number(hour)}`, `BYMINUTE=${Number(minute)}`);

  return parts.join(';');
}

/**
 * Relit une chaine RRULE pour reconstituer l'etat du selecteur visuel.
 * Retourne `null` des que la regle sort de ce que le selecteur sait exprimer :
 * l'appelant bascule alors en saisie manuelle plutot que de deformer la regle.
 */
export function parseRrule(rrule: string): RecurrencePattern | null {
  if (!rrule.trim()) return null;

  const entries = new Map<string, string>();
  for (const part of rrule.split(';')) {
    const [key, value] = part.split('=');
    if (!key || value === undefined) return null;
    entries.set(key.trim().toUpperCase(), value.trim());
  }

  if (entries.get('FREQ') !== 'WEEKLY') return null;

  const known = ['FREQ', 'BYDAY', 'BYHOUR', 'BYMINUTE'];
  if ([...entries.keys()].some((key) => !known.includes(key))) return null;

  const weekdays =
    entries
      .get('BYDAY')
      ?.split(',')
      .map((d) => d.trim()) ?? [];
  if (weekdays.some((day) => !WEEKDAY_VALUES.includes(day))) return null;

  const hour = entries.has('BYHOUR') ? Number(entries.get('BYHOUR')) : 9;
  const minute = entries.has('BYMINUTE') ? Number(entries.get('BYMINUTE')) : 0;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;

  return {
    weekdays: sortWeekdays(weekdays),
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  };
}

/** Resume lisible de la regle, affiche sous le selecteur. */
export function describeRrule(pattern: RecurrencePattern): string {
  const labels = sortWeekdays(pattern.weekdays)
    .map((d) => WEEKDAYS.find((w) => w.value === d)?.label)
    .filter(Boolean);

  if (labels.length === 0) return `Chaque semaine à ${pattern.time}`;
  return `${labels.join(', ')} à ${pattern.time}`;
}

/**
 * Duree separant deux heures `HH:MM`, en minutes.
 * Retourne `null` si la fin ne suit pas le debut : un creneau ne passe pas
 * minuit dans ce formulaire.
 */
export function minutesBetween(start: string, end: string): number | null {
  const toMinutes = (value: string): number | null => {
    const [h, m] = value.split(':').map(Number);
    if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  };

  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from === null || to === null) return null;

  const duration = to - from;
  return duration > 0 ? duration : null;
}

/** Heure de fin correspondant a un debut et une duree, au format `HH:MM`. */
export function addMinutes(start: string, minutes: number): string {
  const [h, m] = start.split(':').map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(
    total % 60,
  ).padStart(2, '0')}`;
}
