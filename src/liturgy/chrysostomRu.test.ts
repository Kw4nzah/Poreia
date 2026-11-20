import { describe, expect, it } from 'vitest';
import { LITURGY_SECTIONS, LITURGY_SPEAKERS } from './types';
import { blocks, source } from './data/chrysostom.ru';

describe('Russian Chrysostom text (azbyka.ru)', () => {
  it('has well-formed blocks with unique ids', () => {
    expect(blocks.length).toBeGreaterThan(700);
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
    for (const b of blocks) {
      expect(LITURGY_SECTIONS).toContain(b.section);
      expect(LITURGY_SPEAKERS).toContain(b.who);
      expect(b.text.trim()).not.toBe('');
      expect(b.text).not.toMatch(/<|&nbsp;|&amp;/);
    }
  });

  it('covers the catechumens, the faithful and the dismissal, and credits azbyka.ru', () => {
    for (const section of ['catechumens', 'faithful', 'dismissal'] as const) {
      expect(blocks.some((b) => b.section === section), section).toBe(true);
    }
    for (const line of Object.values(source)) expect(line).toContain('azbyka.ru');
  });
});
