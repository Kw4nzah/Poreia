import { describe, expect, it } from 'vitest';
import { buildRows, groupKey, subgroupKey, toggleKey } from './listModel';
import {
  MAX_REMEMBERED,
  cleanProgress,
  emptyProgress,
  parseProgress,
  recordPosition,
  restoreIndex,
} from './progress';
import { BACK_TO_TOP_AFTER, readingLineHeight, sectionAtIndex, showBackToTop, showSectionChips, speakerColor } from './reading';
import { matchesQuery, normalizeForSearch } from './search';
import { LITURGY_IDS, LiturgyId } from './types';

describe('search', () => {
  it('ignores case and diacritics', () => {
    expect(normalizeForSearch('İLAHİ Litürji')).toBe('ilahi liturji');
    expect(normalizeForSearch('Ёлка')).toBe('елка');
    expect(normalizeForSearch('Бо́же')).toBe('боже');
    expect(matchesQuery('Divine Liturgy', 'LITURGY')).toBe(true);
    expect(matchesQuery('Ayin Dualarý', 'ayin')).toBe(true);
  });
  it('matches Cyrillic and every word', () => {
    expect(matchesQuery('Последование вечерни', 'ВЕЧЕРНИ послед')).toBe(true);
    expect(matchesQuery('Последование вечерни', 'утрени')).toBe(false);
  });
  it('folds Slavonic letters to modern ones', () => {
    expect(normalizeForSearch('Ѳеодоръ')).toBe('феодоръ');
    expect(matchesQuery('Ѳеодоръ', 'феодоръ')).toBe(true);
  });
  it('an empty query matches everything', () => {
    expect(matchesQuery('x', '  ')).toBe(true);
  });
});

describe('list rows', () => {
  const names: Record<string, string> = { a1: 'Alpha', a2: 'Beta', b1: 'Gamma', m1: 'Moli one', m2: 'Moli two', m3: 'Plain' };
  const base = {
    ids: ['a1', 'a2', 'b1', 'm1', 'm2', 'm3'],
    groups: ['A', 'B', 'M', 'E'],
    groupOf: { a1: 'A', a2: 'A', b1: 'B', m1: 'M', m2: 'M', m3: 'M' },
    subgroupOf: { m1: 'Sub X', m2: 'Sub X' },
    subdivided: ['M'],
    nameOf: (id: string) => names[id],
    query: '',
    expanded: new Set<string>(),
  };

  it('is collapsed by default, with counts and no empty groups', () => {
    const rows = buildRows(base);
    expect(rows.map((r) => r.kind)).toEqual(['group', 'group', 'group']);
    expect(rows.map((r) => (r.kind === 'group' ? r.count : -1))).toEqual([2, 1, 3]);
  });
  it('shows the items of an expanded group', () => {
    const rows = buildRows({ ...base, expanded: new Set([groupKey('A')]) });
    expect(rows.map((r) => r.key)).toEqual(['g:A', 'a1', 'a2', 'g:B', 'g:M']);
  });
  it('collapses Molitvoslov sub-lists on their own', () => {
    const closed = buildRows({ ...base, expanded: new Set([groupKey('M')]) });
    expect(closed.map((r) => r.key)).toEqual(['g:A', 'g:B', 'g:M', 's:M:Sub X', 'm3']);
    const open = buildRows({ ...base, expanded: new Set([groupKey('M'), subgroupKey('M', 'Sub X')]) });
    expect(open.map((r) => r.key)).toEqual(['g:A', 'g:B', 'g:M', 's:M:Sub X', 'm1', 'm2', 'm3']);
  });
  it('opens everything that matches while searching', () => {
    const rows = buildRows({ ...base, query: 'MOLI' });
    expect(rows.map((r) => r.key)).toEqual(['g:M', 's:M:Sub X', 'm1', 'm2']);
    expect(buildRows({ ...base, query: 'zzz' })).toEqual([]);
  });
  it('toggleKey does not mutate', () => {
    const s = new Set(['x']);
    expect([...toggleKey(s, 'y')]).toEqual(['x', 'y']);
    expect([...toggleKey(s, 'x')]).toEqual([]);
    expect([...s]).toEqual(['x']);
  });
});

describe('progress', () => {
  const [one, two] = LITURGY_IDS as readonly LiturgyId[];
  it('cleans junk', () => {
    expect(cleanProgress(null)).toEqual(emptyProgress());
    expect(cleanProgress([1])).toEqual(emptyProgress());
    expect(parseProgress('{oops')).toEqual(emptyProgress());
    expect(parseProgress(null)).toEqual(emptyProgress());
    const p = cleanProgress({ last: { id: one, index: -5 }, positions: { [one]: 7.4, nope: 3, [two]: 'x' } });
    expect(p.last).toEqual({ id: one, index: 0 });
    expect(p.positions).toEqual({ [one]: 7, [two]: 0 });
    expect(cleanProgress({ last: { id: 'nope', index: 1 } }).last).toBeNull();
  });
  it('records and restores', () => {
    const p = recordPosition(recordPosition(emptyProgress(), one, 40), two, 3);
    expect(p.last).toEqual({ id: two, index: 3 });
    expect(restoreIndex(p, one, 100)).toBe(40);
    expect(restoreIndex(p, one, 10)).toBe(9);
    expect(restoreIndex(p, one, 0)).toBe(0);
    expect(restoreIndex(emptyProgress(), one, 10)).toBe(0);
  });
  it('forgets the least recently read services', () => {
    let p = emptyProgress();
    for (const id of LITURGY_IDS.slice(0, MAX_REMEMBERED + 5)) p = recordPosition(p, id, 1);
    expect(Object.keys(p.positions)).toHaveLength(MAX_REMEMBERED);
    expect(p.positions[LITURGY_IDS[0]]).toBeUndefined();
    expect(p.positions[LITURGY_IDS[MAX_REMEMBERED + 4]]).toBe(1);
  });
});

describe('reading helpers', () => {
  it('chips only for several sections', () => {
    expect(showSectionChips(['a'])).toBe(false);
    expect(showSectionChips(['a', 'b'])).toBe(true);
  });
  it('finds the section of a block', () => {
    const starts = { proskomedia: 0, faithful: 50 } as const;
    expect(sectionAtIndex(starts, 10)).toBe('proskomedia');
    expect(sectionAtIndex(starts, 50)).toBe('faithful');
    expect(sectionAtIndex({}, 3)).toBeNull();
  });
  it('back to top threshold and line height', () => {
    expect(showBackToTop(BACK_TO_TOP_AFTER - 1)).toBe(false);
    expect(showBackToTop(BACK_TO_TOP_AFTER)).toBe(true);
    expect(readingLineHeight(20, true)).toBeGreaterThan(readingLineHeight(20, false));
  });
  it('speaker colours exist for speakers, not for rubrics', () => {
    expect(speakerColor('priest', false)).not.toBe(speakerColor('deacon', false));
    expect(speakerColor('rubric', true)).toBeNull();
    expect(speakerColor('people', true)).toMatch(/^#/);
  });
});
