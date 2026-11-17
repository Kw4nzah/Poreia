import { describe, expect, it } from 'vitest';
import app from '../../app.json';
import { CHURCHES } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { FAST_WIDGET_NAME, widgetContentFor } from './content';

const greek = CHURCHES.greek;
const tr = MESSAGES.tr;

describe('widgetContentFor', () => {
  it('names the fast, its progress and what is allowed', () => {
    const content = widgetContentFor({ year: 2026, month: 11, day: 17 }, greek, tr);
    expect(content).toEqual({
      dateLine: 'Salı · 17 Kasım',
      title: 'Noel Orucu',
      eyebrow: 'Noel Orucu',
      status: 'Şarap ve zeytinyağı serbest',
      note: 'Bugün balık yok.',
      hero: { value: '3', suffix: '/ 40' },
      weekday: 'Salı',
      progress: {
        text: '40 günün 3. günü',
        day: 3,
        total: 40,
        counter: '3 / 40',
        left: '37 gün kaldı',
      },
      feast: null,
      fasting: true,
    });
  });

  it('says what remains on a day without the fish rule, and "last day" at the end', () => {
    const lent = widgetContentFor({ year: 2026, month: 2, day: 23 }, greek, tr);
    expect(lent.note).toBe(lent.progress?.left);
    const last = widgetContentFor({ year: 2026, month: 12, day: 24 }, greek, tr);
    expect(last.progress?.left).toBe(tr.today.lastDay);
  });

  it('says plainly when it is not a fasting day', () => {
    const content = widgetContentFor({ year: 2026, month: 10, day: 3 }, greek, tr);
    expect(content.status).toBe(tr.level.none.title);
    expect(content.note).toBe(tr.level.none.detail);
    expect(content.eyebrow).toBe(content.dateLine);
    expect(content.hero).toEqual({ value: '3', suffix: 'Ekim' });
    expect(content.progress).toBeNull();
    expect(content.fasting).toBe(false);
  });

  it('adds the feast name', () => {
    const content = widgetContentFor({ year: 2026, month: 12, day: 25 }, greek, MESSAGES.en);
    expect(content.feast).toBe(MESSAGES.en.feast.nativityOfChrist);
    expect(content.fasting).toBe(false);
  });

  it('is worded in every language without empty lines', () => {
    for (const language of LANGUAGES) {
      const content = widgetContentFor(
        { year: 2026, month: 11, day: 17 },
        greek,
        MESSAGES[language],
      );
      expect(content.title).not.toBe('');
      expect(content.status).not.toBe('');
      expect(content.note).not.toBe('');
      expect(content.eyebrow).not.toBe('');
      expect(content.dateLine).not.toBe('');
      expect(content.progress?.text).toContain('40');
    }
  });
});

describe('widget registration', () => {
  it('app.json declares the widget under the name the task handler uses', () => {
    const plugin = app.expo.plugins.find(
      (entry) => Array.isArray(entry) && entry[0] === 'react-native-android-widget',
    ) as [string, { widgets: { name: string; updatePeriodMillis: number }[] }] | undefined;
    expect(plugin).toBeDefined();
    const widget = plugin?.[1].widgets.find((w) => w.name === FAST_WIDGET_NAME);
    expect(widget).toBeDefined();
    expect(widget?.updatePeriodMillis).toBeGreaterThanOrEqual(30 * 60 * 1000);
  });
});
