import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseSearchIndex, queryWords, searchIndexIds, searchIndexes } from '../src/liturgy/textSearch.ts';
import { buildIndex, encodePostings, stemsOf } from './liturgySearchIndex.mjs';

const roundTrip = (docs) => parseSearchIndex(JSON.stringify(buildIndex(docs)));

describe('index builder', () => {
  it('folds case, accents and Slavonic letters when taking stems', () => {
    expect([...stemsOf('Бо́же, ВОНМЍ Ѳеодоръ; ıspanak')]).toEqual(['боже', 'вонми', 'феодо', 'ispan']);
  });
  it('drops words shorter than three letters and keeps one stem per word', () => {
    expect([...stemsOf('и в ты Господи Господу')]).toEqual(['госпо']);
  });
  it('delta-encodes postings in base 36', () => {
    expect(encodePostings([0, 1, 40, 41])).toBe('0,1,13,1');
    expect(encodePostings([])).toBe('');
  });
  it('sorts documents by id and keeps keys sorted', () => {
    const index = buildIndex([
      { id: 'b', texts: ['zeta alpha'] },
      { id: 'a', texts: ['alpha'] },
    ]);
    expect(index.ids).toEqual(['a', 'b']);
    expect(index.k).toBe('alpha zeta');
    expect(index.p).toEqual(['0,1', '1']);
  });
});

describe('lookup', () => {
  const index = roundTrip([
    { id: 'vespers', texts: ['Господи, воззвах к Тебе', 'Свете тихий святыя славы'] },
    { id: 'matins', texts: ['Слава в вышних Богу', 'Господи, устне мои отверзеши'] },
    { id: 'turkish', texts: ['Rab Tanrı, merhametli ve ışık saçan'] },
  ]);

  it('finds services by a word prefix, accent- and case-insensitively', () => {
    expect(searchIndexIds(index, 'ВОЗЗВАХ')).toEqual(['vespers']);
    expect(searchIndexIds(index, 'сла')).toEqual(['matins', 'vespers']);
    expect(searchIndexIds(index, 'Свѣте')).toEqual(['vespers']);
    expect(searchIndexIds(index, 'ISIK')).toEqual(['turkish']);
  });
  it('needs every word, in any position', () => {
    expect(searchIndexIds(index, 'господи слава')).toEqual(['matins']);
    expect(searchIndexIds(index, 'господи сла')).toEqual(['matins', 'vespers']);
    expect(searchIndexIds(index, 'господи тихий')).toEqual(['vespers']);
    expect(searchIndexIds(index, 'тихий вышних')).toEqual([]);
  });
  it('returns nothing for unknown, too short or empty queries', () => {
    expect(searchIndexIds(index, 'qwerty')).toEqual([]);
    expect(searchIndexIds(index, 'го')).toEqual([]);
    expect(searchIndexIds(index, '  ')).toEqual([]);
    expect(queryWords('и  Го, ГОСПОДИ господи')).toEqual(['господи']);
  });
  it('compares long words by their indexed stem', () => {
    expect(searchIndexIds(index, 'воззвахххх')).toEqual(['vespers']);
  });
  it('unions several languages', () => {
    const other = roundTrip([{ id: 'x', texts: ['Lord have mercy'] }]);
    expect([...searchIndexes([index, other], 'mercy')]).toEqual(['x']);
    expect([...searchIndexes([index, other], 'господи')].sort()).toEqual(['matins', 'vespers']);
  });
  it('rejects a malformed index', () => {
    expect(() => parseSearchIndex('{}')).toThrow();
    expect(() => parseSearchIndex('{"v":1,"stem":5,"ids":[],"k":"a b","p":["0"]}')).toThrow();
  });
});

describe('generated assets', () => {
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'liturgy-index');
  const MAX_BYTES = 3 * 1024 * 1024;

  it('every index file parses and the set stays small', () => {
    let total = 0;
    for (const name of fs.readdirSync(dir)) {
      const raw = fs.readFileSync(path.join(dir, name), 'utf8');
      total += Buffer.byteLength(raw);
      const index = parseSearchIndex(raw);
      expect(index.ids.length).toBeGreaterThan(0);
    }
    expect(total).toBeLessThan(MAX_BYTES);
  });
  it('the Russian index finds the Liturgy by a word from its text', () => {
    const ru = parseSearchIndex(fs.readFileSync(path.join(dir, 'ru.ltxt'), 'utf8'));
    expect(searchIndexIds(ru, 'Господи помилуй')).toContain('basil');
  });
});
