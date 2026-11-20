// Accent- and case-insensitive matching for the services list. Works for Latin (including Turkish
// letters), Cyrillic and Church Slavonic, so "Литургия", "liturgia" and "LITURGIA" all behave.

/** Letters that do not decompose under NFD but should match their plain form. */
const FOLD: Record<string, string> = {
  'ı': 'i', // dotless i
  'ё': 'е', // yo -> ye
  'ѣ': 'е', // yat
  'ѳ': 'ф', // fita
  'ѵ': 'и', // izhitsa
  'ѡ': 'о', // omega
  'ѧ': 'я', // little yus
  'ꙋ': 'у', // monograph uk
  'ß': 'ss',
  'æ': 'ae',
  'œ': 'oe',
  'ø': 'o',
  'đ': 'd',
  'ł': 'l',
};

/** Lower-cased text without combining marks (accents, breathings, titlos), letters folded. */
export function normalizeForSearch(text: string): string {
  let out = '';
  for (const ch of text.normalize('NFD').toLowerCase()) {
    const code = ch.codePointAt(0) ?? 0;
    // Combining marks: Latin/Greek (0300-036F), Cyrillic titlo/pokrytie (0483-0489).
    if ((code >= 0x300 && code <= 0x36f) || (code >= 0x483 && code <= 0x489)) continue;
    out += FOLD[ch] ?? ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** True when every word of `needle` (already normalised) occurs in `haystack` (already normalised). */
export function matchesNormalized(haystack: string, needle: string): boolean {
  if (needle === '') return true;
  return needle.split(' ').every((word) => haystack.includes(word));
}

/** Convenience for one-off checks: normalises both sides. */
export function matchesQuery(name: string, query: string): boolean {
  return matchesNormalized(normalizeForSearch(name), normalizeForSearch(query));
}
