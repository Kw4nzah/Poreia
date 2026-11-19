import { describe, expect, it } from 'vitest';
import { blocks, source } from './data/chrysostom.cu';
import {
  EXPECTED_BLOCK_COUNT,
  EXPECTED_DISMISSAL_FIRST_LINE,
  EXPECTED_FAITHFUL_FIRST_LINE,
  EXPECTED_FIRST_LITURGY_LINE,
  EXPECTED_FIRST_PROSKOMEDIA_LINE,
  EXPECTED_LAST_LINE,
} from './chrysostom.cu.expected';
import { LITURGY_SECTIONS, LITURGY_SPEAKERS } from './types';

describe('Church Slavonic text of the Chrysostom liturgy', () => {
  it('has unique, sequential ids', () => {
    expect(blocks).toHaveLength(EXPECTED_BLOCK_COUNT);
    blocks.forEach((b, i) => expect(b.id).toBe(`cu-${String(i + 1).padStart(4, '0')}`));
    expect(new Set(blocks.map((b) => b.id)).size).toBe(blocks.length);
  });

  it('uses only known sections and speakers, with sections in reading order', () => {
    let last = 0;
    for (const b of blocks) {
      expect(LITURGY_SECTIONS).toContain(b.section);
      expect(LITURGY_SPEAKERS).toContain(b.who);
      const at = LITURGY_SECTIONS.indexOf(b.section);
      expect(at).toBeGreaterThanOrEqual(last);
      last = at;
    }
    for (const section of LITURGY_SECTIONS) {
      expect(blocks.some((b) => b.section === section)).toBe(true);
    }
  });

  it('keeps text empty exactly for omitted blocks', () => {
    for (const b of blocks) {
      if (b.who === 'omitted') expect(b.text).toBe('');
      else expect(b.text).not.toBe('');
    }
  });

  it('keeps no markup and no surrounding whitespace in the text', () => {
    for (const b of blocks) {
      expect(b.text).toBe(b.text.trim());
      expect(b.text).not.toMatch(/[<>]|\s{2,}|\n/);
    }
  });

  it('starts and ends as the source does (constants captured from the downloaded HTML)', () => {
    const proskomedia = blocks.find((b) => b.section === 'proskomedia');
    expect(proskomedia?.text).toBe(EXPECTED_FIRST_PROSKOMEDIA_LINE);
    const firstSpoken = blocks.find((b) => b.section === 'catechumens' && b.who !== 'rubric');
    expect(firstSpoken?.who).toBe('deacon');
    expect(firstSpoken?.text.startsWith(EXPECTED_FIRST_LITURGY_LINE)).toBe(true);
    expect(blocks.find((b) => b.section === 'faithful')?.text).toBe(EXPECTED_FAITHFUL_FIRST_LINE);
    expect(blocks.find((b) => b.section === 'dismissal')?.text).toBe(EXPECTED_DISMISSAL_FIRST_LINE);
    expect(blocks[blocks.length - 1].text).toBe(EXPECTED_LAST_LINE);
  });

  it('carries a source line in the three app languages that names the edition and the project', () => {
    for (const line of [source.tr, source.en, source.ru]) {
      expect(line).toContain('1906');
      expect(line).toContain('ponomar.net');
    }
  });
});
