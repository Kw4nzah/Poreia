import { describe, expect, it } from 'vitest';
import { CHURCHES, CivilDate } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { widgetContentFor } from '../widget/content';
import { COLLAPSED_LINE_MAX } from './content';
import {
  ONGOING_CATEGORY_DONE,
  ONGOING_CATEGORY_TODO,
  describeOngoing,
  ongoingContentFor,
} from './ongoingContent';

const greek = CHURCHES.greek;
const day = (year: number, month: number, d: number): CivilDate => ({ year, month, day: d });

// Day 3 of the Nativity Fast, 2026: a plain fasting day with a counter.
const FAST = day(2026, 11, 17);
// Annunciation inside Great Lent: a feast on a fasting day.
const FEAST_IN_FAST = day(2027, 3, 25);
// Bright Monday 2027 (Easter is 2 May): a day without fasting.
const NO_FAST = day(2027, 5, 3);

describe('ongoingContentFor', () => {
  it('says the fast, its progress, the foods and the date on a fasting day (tr)', () => {
    const c = ongoingContentFor(FAST, greek, 'tr', false);
    expect(c.title).toBe('Noel Orucu');
    expect(c.subtitle).toContain('Salı');
    expect(c.body.split('\n').slice(0, 3)).toEqual([
      'Et, Süt, Balık Yok · 3 / 40. Gün · %8',
      'Serbest: Zeytinyağı, şarap, ekmek, sebze, meyve',
      'Uzak Durulan: Et, süt, yumurta, balık',
    ]);
    expect(c.actionable).toBe(true);
    expect(c.category).toBe(ONGOING_CATEGORY_TODO);
    expect(c.actionLabel).toBe('Bugün oruç tutuyorum');
  });

  it('shows the same food lists and progress as the widget, in every language', () => {
    for (const language of LANGUAGES) {
      const w = widgetContentFor(FAST, greek, language);
      const c = ongoingContentFor(FAST, greek, language, false);
      expect(c.body).toContain(`${w.labels.allowed}: ${w.allowedFoods}`);
      expect(c.body).toContain(`${w.labels.avoided}: ${w.avoidedFoods}`);
      expect(c.body.split('\n')[0]).toContain(w.progress?.badge);
      expect(c.subtitle).toBe(w.dateLine);
    }
  });

  it('marks the title and the body and flips the button once the day is marked', () => {
    for (const language of LANGUAGES) {
      const m = MESSAGES[language];
      const c = ongoingContentFor(FAST, greek, language, true);
      expect(c.title.startsWith('✓ ')).toBe(true);
      expect(c.body.split('\n').at(-1)).toBe(`✓ ${m.widget.completed}`);
      expect(c.category).toBe(ONGOING_CATEGORY_DONE);
      expect(c.actionLabel).toBe(m.settings.ongoingUndo);
    }
  });

  it('puts the feast in the title and names the fast in the first body line', () => {
    for (const language of LANGUAGES) {
      const m = MESSAGES[language];
      const w = widgetContentFor(FEAST_IN_FAST, greek, language);
      const c = ongoingContentFor(FEAST_IN_FAST, greek, language, false);
      expect(w.feast).not.toBeNull();
      expect(c.title).toBe(w.feast);
      expect(c.body.split('\n')[0].startsWith(`${w.title} · `)).toBe(true);
      expect(c.actionable).toBe(true);
      expect(c.actionLabel).toBe(m.widget.complete);
    }
  });

  it('is calm on a day without fasting: no food lists, no button, the weekday as title', () => {
    for (const language of LANGUAGES) {
      const m = MESSAGES[language];
      const w = widgetContentFor(NO_FAST, greek, language);
      expect(w.fasting).toBe(false);
      const c = ongoingContentFor(NO_FAST, greek, language, false);
      expect(c.actionable).toBe(false);
      expect(c.category).toBeNull();
      expect(c.body).not.toContain(`${w.labels.allowed}:`);
      expect(c.body.split('\n')[0]).toBe(w.calmNote);
      expect(c.title).toBe(w.feast ?? `${w.weekday} · ${m.widget.noFast}`);
    }
  });

  it('never marks a day without fasting, even when a mark is stored for it', () => {
    const c = ongoingContentFor(NO_FAST, greek, 'en', true);
    expect(c.title.startsWith('✓')).toBe(false);
    expect(c.body).not.toContain('✓');
    expect(c.category).toBeNull();
  });

  it('adds the reading after the foods when the day has one', () => {
    const w = widgetContentFor(FAST, greek, 'en');
    const c = describeOngoing({ ...w, reading: 'Matt 6:16-18' }, MESSAGES.en, false);
    expect(c.body.split('\n')).toContain('Matt 6:16-18');
    const without = describeOngoing({ ...w, reading: null }, MESSAGES.en, false);
    expect(without.body).not.toContain('Matt');
  });

  it('keeps the collapsed line short and every part non-empty, all year, in every language', () => {
    for (const church of Object.values(CHURCHES)) {
      for (const language of LANGUAGES) {
        for (let dayOfYear = 0; dayOfYear < 366; dayOfYear += 3) {
          const date = new Date(2027, 0, 1 + dayOfYear);
          const civil = day(date.getFullYear(), date.getMonth() + 1, date.getDate());
          for (const marked of [false, true]) {
            const c = ongoingContentFor(civil, church, language, marked);
            const first = c.body.split('\n')[0];
            expect(c.title.trim()).not.toBe('');
            expect(first.trim()).not.toBe('');
            expect(first.length).toBeLessThanOrEqual(COLLAPSED_LINE_MAX);
            expect(c.body).not.toMatch(/undefined|null|NaN/);
            expect(c.actionLabel.trim()).not.toBe('');
          }
        }
      }
    }
  });
});
