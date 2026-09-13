import { describe, expect, it } from 'vitest';
import {
  addMinutes,
  buildRrule,
  describeRrule,
  minutesBetween,
  parseRrule,
  type RecurrencePattern,
} from './rrule';

const pattern = (overrides: Partial<RecurrencePattern> = {}) => ({
  weekdays: ['MO'],
  time: '09:00',
  ...overrides,
});

describe('buildRrule', () => {
  it('builds a weekly rule with the selected days and time', () => {
    expect(buildRrule(pattern({ weekdays: ['MO', 'WE', 'FR'] }))).toBe(
      'FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=9;BYMINUTE=0',
    );
  });

  it('orders the days like the week, not like the selection', () => {
    expect(buildRrule(pattern({ weekdays: ['FR', 'MO'] }))).toContain(
      'BYDAY=MO,FR',
    );
  });

  it('always carries the time, which the backend cannot infer', () => {
    expect(buildRrule(pattern({ time: '14:30' }))).toContain(
      'BYHOUR=14;BYMINUTE=30',
    );
  });
});

describe('parseRrule', () => {
  it('reads back what buildRrule produced', () => {
    const original = pattern({ weekdays: ['SA', 'SU'], time: '08:15' });
    expect(parseRrule(buildRrule(original))).toEqual(original);
  });

  it('defaults the time when the rule carries none', () => {
    expect(parseRrule('FREQ=WEEKLY;BYDAY=MO')).toEqual(pattern());
  });

  it('returns null for an empty rule', () => {
    expect(parseRrule('   ')).toBeNull();
  });

  it('returns null for a frequency the builder no longer exposes', () => {
    expect(parseRrule('FREQ=DAILY;BYHOUR=9')).toBeNull();
    expect(parseRrule('FREQ=MONTHLY')).toBeNull();
  });

  it('returns null when a key falls outside the builder', () => {
    expect(parseRrule('FREQ=WEEKLY;COUNT=10')).toBeNull();
    expect(parseRrule('FREQ=WEEKLY;INTERVAL=2')).toBeNull();
  });

  it('returns null for an unknown weekday', () => {
    expect(parseRrule('FREQ=WEEKLY;BYDAY=XX')).toBeNull();
  });

  it('returns null for an out-of-range hour', () => {
    expect(parseRrule('FREQ=WEEKLY;BYHOUR=25')).toBeNull();
  });

  it('returns null for a malformed rule', () => {
    expect(parseRrule('FREQ')).toBeNull();
  });
});

describe('describeRrule', () => {
  it('names the selected days', () => {
    expect(describeRrule(pattern({ weekdays: ['SA', 'SU'] }))).toBe(
      'Sam, Dim à 09:00',
    );
  });
});

describe('minutesBetween', () => {
  it('measures a plain duration', () => {
    expect(minutesBetween('09:00', '10:30')).toBe(90);
  });

  it('handles minutes that cross an hour', () => {
    expect(minutesBetween('09:45', '10:15')).toBe(30);
  });

  it('rejects an end that precedes the start', () => {
    expect(minutesBetween('10:00', '09:00')).toBeNull();
  });

  it('rejects a zero-length slot', () => {
    expect(minutesBetween('10:00', '10:00')).toBeNull();
  });

  it('rejects a malformed time', () => {
    expect(minutesBetween('', '10:00')).toBeNull();
    expect(minutesBetween('25:00', '26:00')).toBeNull();
  });
});

describe('addMinutes', () => {
  it('shifts a time forward', () => {
    expect(addMinutes('09:00', 90)).toBe('10:30');
  });

  it('pads single digits', () => {
    expect(addMinutes('08:05', 5)).toBe('08:10');
  });
});
