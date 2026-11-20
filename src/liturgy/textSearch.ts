// Full-text lookup over the build-time index of the service texts (assets/liturgy-index/<lang>.ltxt,
// written by scripts/build-liturgy-search-index.mjs, which also documents the format). Pure: no
// file access here; the loader lives in searchIndexLoader.ts.

import { normalizeForSearch } from './search';

export interface TextSearchIndex {
  /** Service ids, the postings refer to positions in this list. */
  ids: readonly string[];
  /** Words are indexed by their first `stem` letters. */
  stem: number;
  /** Sorted word stems. */
  keys: readonly string[];
  /** Encoded postings, parallel to `keys`. */
  postings: readonly string[];
}

/** A query word shorter than this is ignored (the index does not hold such words). */
export const MIN_QUERY_WORD = 3;
export const MIN_QUERY_LENGTH = 3;

export function parseSearchIndex(raw: string): TextSearchIndex {
  const json: unknown = JSON.parse(raw);
  if (typeof json !== 'object' || json === null) throw new Error('search index: bad shape');
  const { v, stem, ids, k, p } = json as Record<string, unknown>;
  if (
    v !== 1 ||
    typeof stem !== 'number' ||
    !Array.isArray(ids) ||
    typeof k !== 'string' ||
    !Array.isArray(p)
  ) {
    throw new Error('search index: bad shape');
  }
  const keys = k === '' ? [] : k.split(' ');
  if (keys.length !== p.length) throw new Error('search index: keys and postings differ');
  return { ids: ids as string[], stem, keys, postings: p as string[] };
}

function decodePostings(encoded: string): number[] {
  const out: number[] = [];
  let prev = 0;
  for (const part of encoded.split(',')) {
    prev += parseInt(part, 36);
    out.push(prev);
  }
  return out;
}

/** The query as index lookup words: folded like the titles, split, short words dropped, deduplicated. */
export function queryWords(query: string): string[] {
  const words = normalizeForSearch(query)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= MIN_QUERY_WORD);
  return [...new Set(words)];
}

/** Position of the first key >= `prefix` in the sorted `keys`. */
function lowerBound(keys: readonly string[], prefix: string): number {
  let lo = 0;
  let hi = keys.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (keys[mid] < prefix) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Positions of the services containing a word that starts with `word` (compared by stem). */
function servicesWithWord(index: TextSearchIndex, word: string): Set<number> {
  const prefix = word.slice(0, index.stem);
  const found = new Set<number>();
  for (let i = lowerBound(index.keys, prefix); i < index.keys.length; i++) {
    if (!index.keys[i].startsWith(prefix)) break;
    for (const n of decodePostings(index.postings[i])) found.add(n);
  }
  return found;
}

/**
 * Ids of the services whose text contains every word of `query` as a word prefix (anywhere in the
 * text, not necessarily together). Words are compared by their first `stem` letters, so a longer
 * query word can also match a different word that shares that start. Empty when the query has no
 * word of MIN_QUERY_WORD letters or more.
 */
export function searchIndexIds(index: TextSearchIndex, query: string): string[] {
  const words = queryWords(query);
  if (words.length === 0) return [];
  let hits = servicesWithWord(index, words[0]);
  for (const word of words.slice(1)) {
    if (hits.size === 0) return [];
    const these = servicesWithWord(index, word);
    hits = new Set([...hits].filter((n) => these.has(n)));
  }
  return [...hits].sort((a, b) => a - b).map((n) => index.ids[n]);
}

/** Union of the matches in several languages' indexes (a service can match in any of its texts). */
export function searchIndexes(indexes: readonly TextSearchIndex[], query: string): Set<string> {
  const out = new Set<string>();
  for (const index of indexes) for (const id of searchIndexIds(index, query)) out.add(id);
  return out;
}
