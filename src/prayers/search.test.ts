import { describe, expect, it } from 'vitest';
import type { PrayerId, PrayerText } from './index';
import { normalizeForSearch, searchPrayers } from './search';

const texts = {
  lordsPrayer: { title: 'Rab’bin Duası', sections: [{ paragraphs: ['Göklerdeki Babamız'] }] },
  creed: { title: 'İman İkrarı', sections: [{ heading: 'Giriş', paragraphs: ['Bir Tanrı’ya inanıyorum'] }] },
} as unknown as Record<PrayerId, PrayerText>;
const ids = ['lordsPrayer', 'creed'] as unknown as PrayerId[];

describe('searchPrayers', () => {
  it('ignores case and accents', () => {
    expect(normalizeForSearch('GÖKLER İman')).toBe('gokler iman');
    expect(searchPrayers('gokler', ids, texts)).toEqual(['lordsPrayer']);
    expect(searchPrayers('IKRARI', ids, texts)).toEqual(['creed']);
  });
  it('matches the text and section headings', () => {
    expect(searchPrayers('inaniyorum', ids, texts)).toEqual(['creed']);
    expect(searchPrayers('giris', ids, texts)).toEqual(['creed']);
  });
  it('returns all for an empty query and none for no match', () => {
    expect(searchPrayers('  ', ids, texts)).toEqual(ids);
    expect(searchPrayers('zzz', ids, texts)).toEqual([]);
  });
});
