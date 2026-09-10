import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('concatène les classes simples', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('ignore les valeurs falsy', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('applique les classes conditionnelles via clsx', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('résout les conflits Tailwind avec twMerge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('combine clsx et twMerge', () => {
    const result = cn('px-2', { 'px-4': true }, 'text-sm');
    expect(result).toBe('px-4 text-sm');
  });

  it("retourne une chaîne vide quand aucun argument n'est fourni", () => {
    expect(cn()).toBe('');
  });
});
