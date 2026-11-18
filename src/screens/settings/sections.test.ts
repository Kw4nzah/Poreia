import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES } from '../../i18n';
import { SECTION_IDS, hourLabel, isSectionId, sectionTitle } from './sections';

describe('settings sections', () => {
  it('accepts only known section ids', () => {
    for (const id of SECTION_IDS) expect(isSectionId(id)).toBe(true);
    for (const bad of ['', 'Profile', 'sources', '__proto__', 'constructor', undefined, 3, null]) {
      expect(isSectionId(bad)).toBe(false);
    }
  });

  it.each(LANGUAGES)('%s has a distinct non-empty title for every section', (language) => {
    const titles = SECTION_IDS.map((id) => sectionTitle(MESSAGES[language], id));
    for (const title of titles) expect(title.trim()).not.toBe('');
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('formats notification hours', () => {
    expect(hourLabel(7)).toBe('07:00');
    expect(hourLabel(12)).toBe('12:00');
  });

  it.each(LANGUAGES)('%s hub summaries are well formed', (language) => {
    const s = MESSAGES[language].settings;
    expect(s.summarySaints(1)).toContain('1');
    expect(s.summarySaints(5)).toContain('5');
    expect(s.summaryNotificationsOn('08:00')).toContain('08:00');
  });
});
