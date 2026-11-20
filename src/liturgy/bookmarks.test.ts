import { describe, expect, it } from 'vitest';
import {
  MAX_REMEMBERED,
  SNIPPET_LENGTH,
  bookmarkIndex,
  clearBookmark,
  cleanProgress,
  emptyProgress,
  hasProgress,
  makeSnippet,
  parseProgress,
  percentRead,
  recordPosition,
  resetService,
  setBookmark,
  toggleBookmark,
} from './progress';
import { LITURGY_IDS, LiturgyId } from './types';

const [one, two] = LITURGY_IDS as readonly LiturgyId[];

describe('snippets', () => {
  it('strips control characters and collapses spaces', () => {
    expect(makeSnippet('  Glory\u0000 to\n\tThee   O God ')).toBe('Glory to Thee O God');
    expect(makeSnippet(42)).toBe('');
  });
  it('caps the length with an ellipsis', () => {
    const s = makeSnippet('word '.repeat(60));
    expect(Array.from(s).length).toBeLessThanOrEqual(SNIPPET_LENGTH);
    expect(s.endsWith('…')).toBe(true);
    expect(makeSnippet('short')).toBe('short');
  });
});

describe('furthest and percent', () => {
  it('furthest never moves back and is capped by the length', () => {
    let p = recordPosition(emptyProgress(), one, 5, { reached: 12, length: 50, snippet: 'a' });
    p = recordPosition(p, one, 2, { reached: 8 });
    expect(p.details[one]).toMatchObject({ furthest: 12, length: 50, snippet: 'a' });
    expect(p.positions[one]).toBe(2);
    p = recordPosition(p, one, 2, { reached: 500 });
    expect(p.details[one]?.furthest).toBe(49);
  });
  it('computes whole percents', () => {
    const p = recordPosition(emptyProgress(), one, 0, { reached: 36, length: 100 });
    expect(percentRead(p.details[one])).toBe(37);
    const done = recordPosition(p, one, 90, { reached: 99 });
    expect(percentRead(done.details[one])).toBe(100);
    expect(percentRead(undefined)).toBeNull();
    expect(percentRead({ furthest: 3, length: 0, snippet: '', bookmark: null })).toBeNull();
  });
  it('a plain 3-argument record keeps no details', () => {
    expect(recordPosition(emptyProgress(), one, 4).details).toEqual({});
  });
  it('hasProgress needs reading past the first block or a bookmark', () => {
    expect(hasProgress(undefined)).toBe(false);
    expect(hasProgress({ furthest: 0, length: 9, snippet: '', bookmark: null })).toBe(false);
    expect(hasProgress({ furthest: 1, length: 9, snippet: '', bookmark: null })).toBe(true);
    expect(hasProgress({ furthest: 0, length: 9, snippet: '', bookmark: { index: 0, snippet: '' } })).toBe(true);
  });
});

describe('bookmark', () => {
  it('sets, replaces, toggles and clears; recording keeps it', () => {
    let p = setBookmark(emptyProgress(), one, 7, 'Seven');
    expect(p.details[one]?.bookmark).toEqual({ index: 7, snippet: 'Seven' });
    p = setBookmark(p, one, 9, 'Nine');
    expect(p.details[one]?.bookmark?.index).toBe(9);
    p = recordPosition(p, one, 3, { length: 20, reached: 5 });
    expect(p.details[one]?.bookmark?.index).toBe(9);
    p = toggleBookmark(p, one, 4, 'Four');
    expect(p.details[one]?.bookmark?.index).toBe(4);
    p = toggleBookmark(p, one, 4, 'Four');
    expect(p.details[one]?.bookmark).toBeNull();
    expect(clearBookmark(emptyProgress(), one)).toEqual(emptyProgress());
  });
  it('does not mutate its input', () => {
    const before = setBookmark(emptyProgress(), one, 1, 'x');
    const copy = JSON.stringify(before);
    setBookmark(before, one, 2, 'y');
    clearBookmark(before, one);
    expect(JSON.stringify(before)).toBe(copy);
  });
  it('finds the bookmark inside the text length', () => {
    const p = setBookmark(emptyProgress(), one, 30, 'x');
    expect(bookmarkIndex(p, one, 100)).toBe(30);
    expect(bookmarkIndex(p, one, 10)).toBe(9);
    expect(bookmarkIndex(p, one, 0)).toBeNull();
    expect(bookmarkIndex(p, two, 10)).toBeNull();
  });
});

describe('reset', () => {
  it('forgets place, furthest and bookmark of one service only', () => {
    let p = recordPosition(emptyProgress(), two, 2, { reached: 4, length: 9 });
    p = setBookmark(recordPosition(p, one, 5, { reached: 8, length: 20 }), one, 6, 'x');
    const r = resetService(p, one);
    expect(r.positions[one]).toBeUndefined();
    expect(r.details[one]).toBeUndefined();
    expect(r.last).toBeNull();
    expect(r.details[two]).toBeDefined();
    expect(resetService(p, two).last?.id).toBe(one);
  });
});

describe('storage compatibility and junk', () => {
  it('parses the old shape without details', () => {
    const p = parseProgress(JSON.stringify({ last: { id: one, index: 4 }, positions: { [one]: 4 } }));
    expect(p.last).toEqual({ id: one, index: 4 });
    expect(p.positions[one]).toBe(4);
    expect(p.details).toEqual({});
  });
  it('round-trips through JSON', () => {
    const p = setBookmark(
      recordPosition(emptyProgress(), one, 3, { reached: 6, length: 10, snippet: 'Hi' }),
      one,
      2,
      'Yo',
    );
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
  });
  it('cleans junk details', () => {
    const p = cleanProgress({
      details: {
        [one]: { furthest: 999, length: 10, snippet: 'a\u0000b', bookmark: { index: -3, snippet: 7 } },
        [two]: 'nope',
        nope: { furthest: 1 },
      },
    });
    expect(p.details[one]).toEqual({ furthest: 9, length: 10, snippet: 'a b', bookmark: { index: 0, snippet: '' } });
    expect(p.details[two]).toBeUndefined();
    expect(Object.keys(p.details)).toHaveLength(1);
    expect(cleanProgress({ details: [1] }).details).toEqual({});
    expect(cleanProgress({ details: { [one]: { bookmark: { index: 'x' } } } }).details[one]?.bookmark).toBeNull();
  });
  it('caps the remembered services', () => {
    let p = emptyProgress();
    for (const id of LITURGY_IDS.slice(0, MAX_REMEMBERED + 5)) p = recordPosition(p, id, 1, { length: 5 });
    expect(Object.keys(p.details)).toHaveLength(MAX_REMEMBERED);
    expect(p.details[LITURGY_IDS[0]]).toBeUndefined();
    const big: Record<string, unknown> = {};
    for (const id of LITURGY_IDS.slice(0, MAX_REMEMBERED + 5)) big[id] = { furthest: 1, length: 5 };
    expect(Object.keys(cleanProgress({ details: big }).details)).toHaveLength(MAX_REMEMBERED);
  });
});
