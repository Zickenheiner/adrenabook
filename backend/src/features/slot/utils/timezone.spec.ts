import { isValidTimeZone, utcToWallClock, wallClockToUtc } from './timezone';

describe('timezone', () => {
  describe('isValidTimeZone', () => {
    it('accepte un identifiant IANA', () => {
      expect(isValidTimeZone('Europe/Paris')).toBe(true);
      expect(isValidTimeZone('UTC')).toBe(true);
    });

    it('refuse un identifiant inconnu', () => {
      expect(isValidTimeZone('Europe/Atlantis')).toBe(false);
      expect(isValidTimeZone('')).toBe(false);
    });
  });

  describe('wallClockToUtc', () => {
    it("convertit une heure murale d'ete en instant UTC", () => {
      // 9h00 le 21 septembre a Paris = 07h00 UTC (UTC+2).
      const wall = new Date(Date.UTC(2026, 8, 21, 9, 0, 0));

      expect(wallClockToUtc(wall, 'Europe/Paris').toISOString()).toBe(
        '2026-09-21T07:00:00.000Z',
      );
    });

    it("convertit une heure murale d'hiver en instant UTC", () => {
      // 9h00 le 21 decembre a Paris = 08h00 UTC (UTC+1) : la meme regle
      // hebdomadaire doit rester a 9h de part et d'autre du changement d'heure.
      const wall = new Date(Date.UTC(2026, 11, 21, 9, 0, 0));

      expect(wallClockToUtc(wall, 'Europe/Paris').toISOString()).toBe(
        '2026-12-21T08:00:00.000Z',
      );
    });

    it('laisse UTC inchange', () => {
      const wall = new Date(Date.UTC(2026, 8, 21, 9, 0, 0));

      expect(wallClockToUtc(wall, 'UTC').toISOString()).toBe(
        '2026-09-21T09:00:00.000Z',
      );
    });

    it('gere un fuseau a decalage negatif', () => {
      // 9h00 a New York le 21 septembre = 13h00 UTC (UTC-4).
      const wall = new Date(Date.UTC(2026, 8, 21, 9, 0, 0));

      expect(wallClockToUtc(wall, 'America/New_York').toISOString()).toBe(
        '2026-09-21T13:00:00.000Z',
      );
    });
  });

  describe('utcToWallClock', () => {
    it('expose les composantes locales du fuseau', () => {
      const instant = new Date('2026-09-21T07:00:00.000Z');

      expect(utcToWallClock(instant, 'Europe/Paris').toISOString()).toBe(
        '2026-09-21T09:00:00.000Z',
      );
    });

    it('fait l aller-retour avec wallClockToUtc', () => {
      const wall = new Date(Date.UTC(2026, 5, 3, 14, 30, 0));
      const instant = wallClockToUtc(wall, 'Europe/Paris');

      expect(utcToWallClock(instant, 'Europe/Paris').toISOString()).toBe(
        wall.toISOString(),
      );
    });
  });
});
