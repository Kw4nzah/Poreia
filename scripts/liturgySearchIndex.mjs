// Pure logic of the services full-text search index (no file access, so it is unit-tested).
// Format (JSON, one file per text language); src/liturgy/textSearch.ts reads it:
//   { v: 1, stem: N, ids: [serviceId...], k: "stem1 stem2 ...", p: ["postings1", "postings2", ...] }
// `k` holds the sorted word stems separated by spaces; `p[i]` lists the services containing stem
// k[i] as ascending indexes into `ids`, delta-encoded, base 36, comma-separated.
import { normalizeForSearch } from '../src/liturgy/search.ts';

export const INDEX_VERSION = 1;
/** Words are indexed by their first STEM_LENGTH letters; the lookup matches by prefix. */
export const STEM_LENGTH = 5;
/** Shorter words are not indexed (too common to narrow anything down). */
export const MIN_WORD_LENGTH = 3;

/** Distinct word stems of `text` (accent/case folded with the same function as the title search). */
export function stemsOf(text, stemLength = STEM_LENGTH) {
  const out = new Set();
  for (const word of normalizeForSearch(text).split(/[^\p{L}\p{N}]+/u)) {
    if (word.length >= MIN_WORD_LENGTH) out.add(word.slice(0, stemLength));
  }
  return out;
}

export function encodePostings(indexes) {
  let prev = 0;
  return indexes
    .map((n) => {
      const d = n - prev;
      prev = n;
      return d.toString(36);
    })
    .join(',');
}

const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Builds the index of one language. `docs` is [{ id, texts: string[] }] (the readable texts of the
 * service); a document without any word stays in `ids` but appears in no posting.
 */
export function buildIndex(docs, stemLength = STEM_LENGTH) {
  const sorted = [...docs].sort((a, b) => byCodePoint(a.id, b.id));
  const postings = new Map();
  sorted.forEach((doc, i) => {
    for (const stem of stemsOf(doc.texts.join('\n'), stemLength)) {
      let list = postings.get(stem);
      if (!list) postings.set(stem, (list = []));
      list.push(i);
    }
  });
  const keys = [...postings.keys()].sort(byCodePoint);
  return {
    v: INDEX_VERSION,
    stem: stemLength,
    ids: sorted.map((d) => d.id),
    k: keys.join(' '),
    p: keys.map((key) => encodePostings(postings.get(key))),
  };
}
