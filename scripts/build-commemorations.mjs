// Builds src/commemorations/data/<tradition>-<year>.json from the orthocal.info API.
//
// Keeps ONLY facts: feast and saint names, the weekday title and the scripture
// references (book, chapter, verse runs). The saints' lives (`stories`) and the
// English verse text are deliberately dropped: the lives are used on orthocal.info
// by permission of Abbamoses.com and may not be redistributed here.
//
// Usage: node scripts/build-commemorations.mjs 2026 2027
// gregorian = Greek tradition (new calendar), julian = Russian tradition (old calendar).

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src', 'commemorations', 'data');
const years = process.argv.slice(2).map(Number).filter(Boolean);
if (years.length === 0) {
  console.error('usage: node scripts/build-commemorations.mjs <year> [<year> ...]');
  process.exit(1);
}

const traditions = ['gregorian', 'julian'];

function daysOf(year) {
  const out = [];
  for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push([d.getUTCMonth() + 1, d.getUTCDate()]);
  }
  return out;
}

async function getJson(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} ${url}`);
    } catch (e) {
      if (attempt === 4) throw e;
    }
    await new Promise((r) => setTimeout(r, 500 * attempt * attempt));
  }
  throw new Error(`gave up on ${url}`);
}

// Collapses the verse list of one reading into contiguous runs:
// [book, chapter1, verse1, chapter2, verse2].
function runsOf(passage) {
  const runs = [];
  for (const v of passage) {
    const last = runs[runs.length - 1];
    const next =
      last &&
      last[0] === v.book &&
      ((last[3] === v.chapter && last[4] + 1 === v.verse) || (last[3] + 1 === v.chapter && v.verse === 1));
    if (next) {
      last[3] = v.chapter;
      last[4] = v.verse;
    } else {
      runs.push([v.book, v.chapter, v.verse, v.chapter, v.verse]);
    }
  }
  return runs;
}

function compact(day) {
  return {
    // weekday / Sunday title, e.g. "Monday of the 25th week after Pentecost"
    t: day.titles ?? [],
    // feast names first, then saints, without duplicates
    n: [...new Set([...(day.feasts ?? []), ...(day.saints ?? [])])],
    // feast level 0..8 from orthocal (4 = polyeleos, 7-8 = great feasts)
    l: day.feast_level ?? 0,
    // Composite readings (compiled excerpts from several books, some Vespers readings) have no
    // book code on their verses: keep only the published display text `d`, no verse runs.
    r: (day.readings ?? []).map((r) => {
      const passage = r.passage ?? [];
      const plain = passage.length > 0 && passage.every((p) => p.book);
      return plain
        ? { s: r.source, v: runsOf(passage) }
        : { s: r.source, v: [], d: r.display };
    }),
  };
}

async function pool(items, size, fn) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const k = i++;
        results[k] = await fn(items[k]);
      }
    }),
  );
  return results;
}

await mkdir(outDir, { recursive: true });
for (const year of years) {
  for (const tradition of traditions) {
    const days = daysOf(year);
    const fetched = await pool(days, 6, ([m, d]) =>
      getJson(`https://orthocal.info/api/${tradition}/${year}/${m}/${d}/`),
    );
    const data = {};
    days.forEach(([m, d], k) => {
      data[`${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`] = compact(fetched[k]);
    });
    const file = join(outDir, `${tradition}-${year}.json`);
    await writeFile(file, JSON.stringify(data));
    const bytes = Buffer.byteLength(JSON.stringify(data));
    console.log(`${tradition} ${year}: ${days.length} days, ${(bytes / 1024).toFixed(0)} KB`);
  }
}
