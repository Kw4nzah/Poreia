import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES } from '../i18n';
import { LOADERS } from './data';
import { LITURGY_GROUP_OF, LITURGY_GROUPS, LITURGY_IDS, LITURGY_SECTIONS, LITURGY_SPEAKERS } from './types';

// Church Slavonic and Russian texts generated from azbyka.ru (used with its written permission).
const cases = LITURGY_IDS.flatMap((id) =>
  (LITURGY_GROUP_OF[id] === 'prayersEn' ? (['en'] as const) : (['cu', 'ru'] as const)).map(
    (language) => [id, language] as const,
  ),
);

describe.each(cases)('azbyka.ru text: %s %s', (id, language) => {
  it('has well-formed blocks with unique ids and credits azbyka.ru', async () => {
    const loader = LOADERS[id]?.[language];
    if (!loader) return; // some prayers exist in one language only
    const { blocks, source } = await loader();
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
