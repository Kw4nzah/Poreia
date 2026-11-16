import { describe, expect, it } from 'vitest';
import { parseService } from './service';

describe('parseService', () => {
  it('splits the service names the data uses', () => {
    expect(parseService('Vespers')).toEqual({ kind: 'vespers' });
    expect(parseService('Vespers Gospel')).toEqual({ kind: 'vespers', part: 'gospel' });
    expect(parseService('3rd Matins Gospel')).toEqual({ kind: 'matins', n: 3, part: 'gospel' });
    expect(parseService('Matins Gospel')).toEqual({ kind: 'matins', part: 'gospel' });
    expect(parseService('6th Hour, Prophecy')).toEqual({ kind: 'hour', n: 6, part: 'prophecy' });
    expect(parseService('1st Hour')).toEqual({ kind: 'hour', n: 1 });
    expect(parseService('12th Passion Gospel')).toEqual({ kind: 'passion', n: 12, part: 'gospel' });
    expect(parseService('Great Blessing of Waters')).toEqual({ kind: 'waters' });
    expect(parseService('Cross Procession')).toEqual({ kind: 'cross' });
  });
  it('returns null for names it does not know', () => {
    expect(parseService('Something else')).toBeNull();
  });
});

import { MESSAGES } from '../i18n';

describe('service names in every language', () => {
  it('names every recognised service', () => {
    const sources = [
      'Vespers',
      'Vespers Gospel',
      '3rd Matins Gospel',
      'Matins',
      'Matins Epistle',
      '6th Hour, Prophecy',
      '9th Hour, Gospel',
      '1st Hour',
      '12th Passion Gospel',
      'Great Blessing of Waters',
      'Cross Procession',
    ];
    for (const messages of Object.values(MESSAGES)) {
      for (const source of sources) {
        const parsed = parseService(source);
        expect(parsed).not.toBeNull();
        expect(messages.readings.service(parsed!).length).toBeGreaterThan(2);
      }
    }
    expect(MESSAGES.ru.readings.service(parseService('3rd Matins Gospel')!)).toBe(
      '3-е Евангелие на утрене',
    );
    expect(MESSAGES.tr.readings.service(parseService('6th Hour, Prophecy')!)).toBe(
      '6. Saat, Peygamberlik okuması',
    );
  });
});
