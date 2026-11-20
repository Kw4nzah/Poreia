import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES } from '../i18n';
import fs from 'node:fs';
import path from 'node:path';
import { hasLiturgyAsset, LITURGY_ASSET_DIR, readLiturgyAsset } from './assetFiles';
import { parseLiturgyText } from './parseLiturgyText';
import { LITURGY_GROUP_OF, LITURGY_GROUPS, LITURGY_IDS, LITURGY_SECTIONS, LITURGY_SPEAKERS } from './types';

// Church Slavonic and Russian texts generated from azbyka.ru (used with its written permission).
const cases = LITURGY_IDS.flatMap((id) =>
  (LITURGY_GROUP_OF[id] === 'prayersEn' ? (['en'] as const) : (['cu', 'ru'] as const)).map(
    (language) => [id, language] as const,
  ),
);

describe.each(cases)('azbyka.ru text: %s %s', (id, language) => {
  it('has well-formed blocks with unique ids and credits azbyka.ru', async () => {
    if (!hasLiturgyAsset(id, language)) return; // some prayers exist in one language only
    const { blocks, source } = readLiturgyAsset(id, language);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
    for (const b of blocks) {
      expect(LITURGY_SECTIONS).toContain(b.section);
      expect(LITURGY_SPEAKERS).toContain(b.who);
      expect(b.text.trim()).not.toBe('');
      expect(b.text).not.toMatch(/<\/?[a-z!]|&nbsp;|&amp;/);
    }
    if (LITURGY_GROUP_OF[id] === 'liturgies') {
      for (const section of ['catechumens', 'faithful', 'dismissal'] as const) {
        expect(blocks.some((b) => b.section === section), section).toBe(true);
      }
    } else {
      expect(blocks.every((b) => b.section === 'service')).toBe(true);
    }
    for (const line of Object.values(source)) expect(line).toContain('azbyka.ru');
  });
});

describe('services list', () => {
  it.each(LANGUAGES)('%s names every service and group', (language) => {
    const { names, groups } = MESSAGES[language].liturgy;
    for (const id of LITURGY_IDS) expect(names[id]?.trim(), id).toBeTruthy();
    for (const group of LITURGY_GROUPS) expect(groups[group].trim()).not.toBe('');
  });
});

describe('asset map', () => {
  // The generated index.ts needs Metro (require of .ltxt), so read it as text here.
  const indexSource = fs.readFileSync(path.join(__dirname, 'data', 'index.ts'), 'utf8');
  const mapped = [
    ...indexSource.matchAll(/require\('\.\.\/\.\.\/\.\.\/assets\/liturgy\/([^']+)\.(cu|en|ru|tr)\.ltxt'\)/g),
  ].map((m) => `${m[1]}.${m[2]}.ltxt`);
  const files = fs.readdirSync(LITURGY_ASSET_DIR).filter((f) => f.endsWith('.ltxt'));

  it('lists every asset file and no missing one', () => {
    expect([...mapped].sort()).toEqual([...files].sort());
    expect(new Set(mapped).size).toBe(mapped.length);
  });

  it('only maps known liturgy ids', () => {
    for (const name of mapped) expect(LITURGY_IDS as readonly string[]).toContain(name.split('.')[0]);
  });

  it('parses every file with the runtime validator', () => {
    for (const name of files) {
      const raw = fs.readFileSync(path.join(LITURGY_ASSET_DIR, name), 'utf8');
      expect(() => parseLiturgyText(raw), name).not.toThrow();
    }
  });

  it('rejects malformed text', () => {
    expect(() => parseLiturgyText('not json')).toThrow();
    expect(() => parseLiturgyText('{"blocks":[],"source":{"tr":"","en":"","ru":""}}')).toThrow();
    const bad = { blocks: [{ id: 'x', section: 'nope', who: 'priest', text: 'a' }], source: { tr: '', en: '', ru: '' } };
    expect(() => parseLiturgyText(JSON.stringify(bad))).toThrow();
  });
});
