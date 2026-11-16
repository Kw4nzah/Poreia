import { describe, expect, it } from 'vitest';
import { MESSAGES } from '../i18n';
import { describeContent } from './contentVersion';

describe('describeContent', () => {
  const when = new Date(2026, 10, 16, 20, 27); // local time, 16 Nov 2026 20:27

  it('shows the release time of a downloaded bundle in each language', () => {
    expect(describeContent(MESSAGES.en, false, when)).toContain('20:27');
    expect(describeContent(MESSAGES.en, false, when)).toContain('2026');
    expect(describeContent(MESSAGES.tr, false, when)).toContain('20:27');
    expect(describeContent(MESSAGES.ru, false, when)).toContain('20:27');
  });

  it('says the content is as shipped for the embedded bundle or an unknown time', () => {
    expect(describeContent(MESSAGES.en, true, when)).toBe(MESSAGES.en.settings.contentShipped);
    expect(describeContent(MESSAGES.tr, false, null)).toBe(MESSAGES.tr.settings.contentShipped);
    expect(describeContent(MESSAGES.ru, false, new Date('x'))).toBe(MESSAGES.ru.settings.contentShipped);
  });
});
