// Builds src/commemorations/data/text-<lang>.json: the New Testament verses that the bundled
// lectionary data (see build-commemorations.mjs) refers to, taken from public-domain
// translations published by eBible.org as USFM:
//   en = World English Bible (engwebu), ru = Synodal Translation 1876 (russyn).
//
// Only New Testament books are extracted. Old Testament readings follow Septuagint
// numbering, which these translations (Masoretic) do not share, so they stay references.
//
// Usage: node scripts/build-reading-texts.mjs <en-usfm-dir> <ru-usfm-dir>
// Download first: https://ebible.org/Scriptures/engwebu_usfm.zip and russyn_usfm.zip

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src', 'commemorations', 'data');
const [enDir, ruDir] = process.argv.slice(2);
if (!enDir || !ruDir) {
  console.error('usage: node scripts/build-reading-texts.mjs <en-usfm-dir> <ru-usfm-dir>');
  process.exit(1);
}

const NEW_TESTAMENT = new Set(
  'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' '),
);

// Which verses the data refers to: needed[book] = Set of "chapter:verse".
// Runs are [book, c1, v1, c2, v2]; a run crossing chapters needs the chapter lengths.
async function neededRuns() {
  const runs = [];
  for (const name of await readdir(dataDir)) {
    if (!/^(gregorian|julian)-\d{4}\.json$/.test(name)) continue;
    const year = JSON.parse(await readFile(join(dataDir, name), 'utf8'));
    for (const day of Object.values(year)) {
      for (const reading of day.r) for (const run of reading.v) if (NEW_TESTAMENT.has(run[0])) runs.push(run);
    }
  }
  return runs;
}

function clean(text) {
  return text
    .replace(/\\f\s.*?\\f\*/g, '') // footnotes
    .replace(/\\x\s.*?\\x\*/g, '') // cross references
    .replace(/\\\+?w\s+([^|\\]*?)(\|[^\\]*)?\\\+?w\*/g, '$1') // \w word|strong="G1"\w*, nested \+w
    .replace(/\\\+?[a-z0-9]+\*?/gi, '') // any other character or paragraph marker
    .replace(/\s+/g, ' ')
    .trim();
}

// Parses one USFM book into { chapter: { verse: text } }; a verse bridge "3-4" keeps its text
// on the first number and leaves the others empty.
function parseBook(usfm) {
  const chapters = {};
  let chapter = 0;
  let verse = null;
  const skip = /^\\(id|ide|h|toc\d|mt\d?|ms\d?|mr|s\d?|sr|r|rem|d|sp|b|cl|cp|cd)\b/;
  for (const raw of usfm.split(/\r?\n/)) {
    const line = raw.trim();
    const c = line.match(/^\\c\s+(\d+)/);
    if (c) {
      chapter = Number(c[1]);
      chapters[chapter] = {};
      verse = null;
      continue;
    }
    if (skip.test(line)) continue;
    // A line can hold several verses ("\v 1 text \v 2 text").
    const parts = line.split(/(?=\\v\s)/);
    for (const part of parts) {
      const v = part.match(/^\\v\s+(\d+)(?:-(\d+))?\s*(.*)$/s);
      if (v) {
        verse = Number(v[1]);
        chapters[chapter][verse] = clean(v[3]);
        if (v[2]) for (let n = verse + 1; n <= Number(v[2]); n++) chapters[chapter][n] = '';
      } else if (verse !== null && chapter) {
        const extra = clean(part);
        if (extra) chapters[chapter][verse] = `${chapters[chapter][verse]} ${extra}`.trim();
      }
    }
  }
  return chapters;
}

async function loadBooks(dir) {
  const books = {};
  for (const name of await readdir(dir)) {
    const m = name.match(/^\d+-([0-9A-Z]{3})/);
    if (m && NEW_TESTAMENT.has(m[1])) books[m[1]] = parseBook(await readFile(join(dir, name), 'utf8'));
  }
  return books;
}

// Verse numbering that differs between WEB and the Synodal Translation (found by comparing the
// verse count of every New Testament chapter on 2026-11-16: only these chapters differ).
// A run touching one of these ranges gets no text in either language, only its reference.
const NUMBERING_DIFFERS = [
  ['ACT', 19, 40, 19, 41],
  ['ROM', 16, 24, 16, 27],
  ['2CO', 11, 32, 11, 33],
  ['2CO', 13, 11, 13, 14],
  ['3JN', 1, 13, 1, 15],
];

// Compares (chapter, verse) pairs as one number; chapters have fewer than 1000 verses.
const at = (c, v) => c * 1000 + v;
function touchesDifference([book, c1, v1, c2, v2]) {
  return NUMBERING_DIFFERS.some(
    ([b, dc1, dv1, dc2, dv2]) => b === book && at(c1, v1) <= at(dc2, dv2) && at(c2, v2) >= at(dc1, dv1),
  );
}

const runs = (await neededRuns()).filter((run) => !touchesDifference(run));
for (const [lang, dir] of [['en', enDir], ['ru', ruDir]]) {
  const books = await loadBooks(dir);
  const out = {};
  const problems = [];
  let count = 0;
  for (const [book, c1, v1, c2, v2] of runs) {
    const text = books[book];
    if (!text) {
      problems.push(`${book}: book missing`);
      continue;
    }
    for (let c = c1; c <= c2; c++) {
      const last = c === c2 ? v2 : Math.max(...Object.keys(text[c] ?? { 0: 0 }).map(Number));
      for (let v = c === c1 ? v1 : 1; v <= last; v++) {
        const verse = text[c]?.[v];
        if (verse === undefined) {
          problems.push(`${book} ${c}:${v}`);
          continue;
        }
        ((out[book] ??= {})[c] ??= {})[v] = verse;
      }
    }
  }
  for (const b of Object.values(out)) for (const c of Object.values(b)) count += Object.keys(c).length;
  const json = JSON.stringify(out);
  await writeFile(join(dataDir, `text-${lang}.json`), json);
  const unique = [...new Set(problems)];
  console.log(`${lang}: ${count} verses, ${(Buffer.byteLength(json) / 1024).toFixed(0)} KB, missing ${unique.length}`);
  if (unique.length) console.log('  missing sample:', unique.slice(0, 12).join(', '));
}
