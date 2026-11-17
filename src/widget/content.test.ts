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
      rule: 'Şarap ve zeytinyağı serbest',
      detail: 'Bugün balık yok.',
      progress: { text: '40 günün 3. günü', day: 3, total: 40 },
      feast: null,
      fasting: true,
    });
  });

  it('says plainly when it is not a fasting day', () => {
    const content = widgetContentFor({ year: 2026, month: 10, day: 3 }, greek, tr);
    expect(content.title).toBe(tr.level.none.title);
    expect(content.rule).toBe(tr.level.none.detail);
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
      expect(content.rule).not.toBe('');
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
