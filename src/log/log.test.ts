import { describe, expect, it, vi } from 'vitest';
import { CivilDate, gregorianToJdn } from '../calendar';
import { doneDaysFromEntries, parseDoneKey } from './log';

const j = (year: number, month: number, day: number) => gregorianToJdn(year, month, day);
const d = (year: number, month: number, day: number): CivilDate => ({ year, month, day });


describe('parseDoneKey', () => {
  it('reads valid keys', () => {
    expect(parseDoneKey('poreia.done.2026-11-17')).toEqual(d(2026, 11, 17));
    expect(parseDoneKey('poreia.done.2028-02-29')).toEqual(d(2028, 2, 29));
  });

  it.each([
    'poreia.done.2026-02-30',
    'poreia.done.2027-02-29',
    'poreia.done.2026-13-01',
    'poreia.done.2026-00-10',
    'poreia.done.2026-1-5',
    'poreia.done.2026-11-17 ',
    'poreia.done.',
    'poreia.done.0001-01-01',
    'poreia.done.9999-01-01',
    'poreia.settings',
    'other.poreia.done.2026-11-17',
  ])('rejects %s', (key) => {
    expect(parseDoneKey(key)).toBeNull();
  });

  it('rejects non-strings without throwing', () => {
    for (const bad of [null, undefined, 5, {}, ['poreia.done.2026-11-17']]) {
      expect(parseDoneKey(bad)).toBeNull();
    }
  });
});

describe('doneDaysFromEntries', () => {
  it('keeps only valid keys with the marked value', () => {
    const result = doneDaysFromEntries([
      ['poreia.done.2026-11-17', '1'],
      ['poreia.done.2026-11-18', '0'],
      ['poreia.done.2026-11-19', 'true'],
      ['poreia.done.2026-11-20', null],
      ['poreia.done.2026-11-21', 1],
      ['poreia.done.2026-02-31', '1'],
      ['poreia.settings', '1'],
      [null, '1'],
      ['poreia.done.2026-11-22', '1'],
    ]);
    expect([...result].sort()).toEqual([j(2026, 11, 17), j(2026, 11, 22)]);
  });

  it('accepts an empty list', () => {
    expect(doneDaysFromEntries([]).size).toBe(0);
  });
});
