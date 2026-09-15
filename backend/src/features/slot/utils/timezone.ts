/**
 * Conversion entre heure murale et instant absolu pour un fuseau IANA.
 *
 * La librairie `rrule` raisonne sur les composantes UTC d'une Date : une regle
 * portant BYHOUR=9 produit des dates a 09h00 UTC, quel que soit le fuseau du
 * serveur. Ces dates decrivent donc une heure murale, pas un instant : c'est
 * ici qu'on les rattache au fuseau du professionnel.
 *
 * Intl suffit : il porte la base IANA, transitions heure d'ete comprises, sans
 * dependance supplementaire.
 */

/** Une heure murale : les composantes locales logees dans les champs UTC. */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Instant absolu -> heure murale du fuseau, logee dans les champs UTC d'une
 * Date pour rester comparable a ce que produit `rrule`.
 */
export function utcToWallClock(instant: Date, timeZone: string): Date {
  const parts = getFormatter(timeZone).formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);

  // `hour12: false` rend minuit sur 24 dans certaines implementations.
  const hour = value('hour') % 24;

  return new Date(
    Date.UTC(
      value('year'),
      value('month') - 1,
      value('day'),
      hour,
      value('minute'),
      value('second'),
      instant.getMilliseconds(),
    ),
  );
}

/** Decalage du fuseau, en millisecondes, a l'instant donne. */
function offsetAt(instant: Date, timeZone: string): number {
  return utcToWallClock(instant, timeZone).getTime() - instant.getTime();
}

/**
 * Heure murale -> instant absolu.
 *
 * Le decalage depend de l'instant cherche : on l'approche une premiere fois,
 * puis on le corrige. Cette seconde passe rattrape les dates situees juste
 * apres un changement d'heure.
 */
export function wallClockToUtc(wallClock: Date, timeZone: string): Date {
  const wall = wallClock.getTime();
  const approximate = new Date(wall - offsetAt(wallClock, timeZone));
  return new Date(wall - offsetAt(approximate, timeZone));
}
