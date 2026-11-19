import { describe, expect, it } from 'vitest';
import { blocks, source } from './data/chrysostom.tr';
import { LITURGY_SECTIONS, LITURGY_SPEAKERS } from './types';

// The booklet starts at the Great Litany, so this text has no 'proskomedia'.
const SECTIONS_PRESENT = LITURGY_SECTIONS.filter((section) => section !== 'proskomedia');

describe('Turkish text of the Chrysostom liturgy', () => {
  it('has unique, sequential ids', () => {
    expect(blocks).toHaveLength(373);
    blocks.forEach((b, i) => expect(b.id).toBe(`tr-${String(i + 1).padStart(4, '0')}`));
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
    for (const section of SECTIONS_PRESENT) {
      expect(blocks.some((b) => b.section === section), section).toBe(true);
    }
    expect(blocks.some((b) => b.section === 'proskomedia')).toBe(false);
  });

  it('keeps text empty exactly for omitted blocks', () => {
    for (const b of blocks) {
      if (b.who === 'omitted') expect(b.text).toBe('');
      else expect(b.text).not.toBe('');
    }
  });

  it('keeps no markup, soft hyphens or surrounding whitespace in the text', () => {
    for (const b of blocks) {
      expect(b.text).toBe(b.text.trim());
      expect(b.text, b.id).not.toMatch(/[<>­]|\s{2,}|\n/);
    }
  });

  it('keeps no page numbers and no running heads', () => {
    for (const b of blocks) {
      expect(b.text, b.id).not.toMatch(/^\d+(\s\d+)*$/);
      expect(b.text.replace(/\s/g, '').toUpperCase(), b.id).not.toMatch(/YUHANNA.{0,4}NIN.?KUTSAL.{0,4}METN/);
    }
  });

  it('keeps no speaker labels as text', () => {
    for (const b of blocks) {
      expect(b.text, b.id).not.toMatch(/^(OYAKOS|RUHAN\s?[iİ]|KORO|OKUYUCU)\b/);
    }
  });

  it('starts and ends as the booklet does', () => {
    expect(blocks[0]).toMatchObject({ section: 'catechumens', who: 'deacon', text: 'Kutsa, ey aziz Peder.' });
    const faithful = blocks.find((b) => b.section === 'faithful');
    expect(faithful?.text.startsWith('Amin. Ey Heruvimleri gizemle temsil eden')).toBe(true);
    const dismissal = blocks.find((b) => b.section === 'dismissal');
    expect(dismissal?.text).toBe('Şükran Duası');
    expect(dismissal?.who).toBe('rubric');
    expect(blocks[blocks.length - 1].who).toBe('rubric');
    expect(blocks[blocks.length - 1].text.startsWith('(Ruhani cemaate')).toBe(true);
  });

  it('carries a source line in the three app languages that names the booklet and the website', () => {
    for (const line of [source.tr, source.en, source.ru]) {
      expect(line).toContain('Altın Ağızlı Yuhanna’nın Kutsal Ayin Metni');
      expect(line).toContain('ortodokslartoplulugu.com');
    }
  });
});
