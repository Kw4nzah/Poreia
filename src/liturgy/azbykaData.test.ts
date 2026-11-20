import { describe, expect, it } from 'vitest';
import { LOADERS } from './data';
import { LITURGY_SECTIONS, LITURGY_SPEAKERS } from './types';

// Church Slavonic and Russian texts generated from azbyka.ru (used with its written permission).
const cases = (['chrysostom', 'basil', 'presanctified'] as const).flatMap((id) =>
  (['cu', 'ru'] as const).map((language) => [id, language] as const),
);

describe.each(cases)('azbyka.ru text: %s %s', (id, language) => {
  it('has well-formed blocks with unique ids and credits azbyka.ru', async () => {
    const data = await LOADERS[id]![language]!();
    const { blocks, source } = data;
    expect(blocks.length).toBeGreaterThan(300);
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
    for (const b of blocks) {
      expect(LITURGY_SECTIONS).toContain(b.section);
      expect(LITURGY_SPEAKERS).toContain(b.who);
      expect(b.text.trim()).not.toBe('');
      expect(b.text).not.toMatch(/<|&nbsp;|&amp;/);
    }
    for (const section of ['catechumens', 'faithful', 'dismissal'] as const) {
      expect(blocks.some((b) => b.section === section), section).toBe(true);
    }
    for (const line of Object.values(source)) expect(line).toContain('azbyka.ru');
  });
});
