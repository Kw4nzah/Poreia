import { describe, expect, it, vi } from 'vitest';

// Same mocks as tree.test.tsx: the widget library's native module is not available in vitest.
vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Image: {},
  NativeModules: {},
  AppRegistry: { registerHeadlessTask: () => {} },
  TurboModuleRegistry: { getEnforcing: () => ({}) },
}));

vi.mock('react-native-android-widget', async () => ({
  ...(await import('react-native-android-widget/src/widgets/FlexWidget')),
  ...(await import('react-native-android-widget/src/widgets/TextWidget')),
  ...(await import('react-native-android-widget/src/widgets/SvgWidget')),
}));

interface Tree {
  props: { clickAction?: string };
  children?: Tree[];
}

function clickActions(tree: Tree): string[] {
  return [
    ...(tree.props?.clickAction ? [tree.props.clickAction] : []),
    ...(tree.children ?? []).flatMap(clickActions),
  ];
}

const settingsFor = (language: 'tr' | 'en' | 'ru') =>
  ({ language, churchId: 'greek', greekFish: 'unsure' }) as const;

describe('strip widget (4x1)', () => {
  it('builds in light and dark for every language and size, with the OPEN_APP card', async () => {
    const { buildWidgetTree } =
      await import('react-native-android-widget/src/api/build-widget-tree');
    const { buildStripWidget } = await import('./StripWidget');
    for (const language of ['tr', 'en', 'ru'] as const) {
      for (const size of [
        { width: 0, height: 0 },
        { width: 220, height: 70 },
        { width: 340, height: 70 },
      ]) {
        for (const day of [new Date(2026, 10, 17), new Date(2026, 9, 3), new Date(2026, 11, 25)]) {
          const { light, dark } = buildStripWidget(settingsFor(language), size, day, false);
          for (const element of [light, dark]) {
            const tree = buildWidgetTree(element);
            expect(tree.type).toBe('LinearLayoutWidget');
            expect(JSON.stringify(tree)).toContain('"clickAction":"OPEN_APP"');
          }
        }
      }
    }
  });

  it('has the fasting button only on fasting days', async () => {
    const { buildWidgetTree } =
      await import('react-native-android-widget/src/api/build-widget-tree');
    const { buildStripWidget } = await import('./StripWidget');
    const actions = (now: Date) =>
      clickActions(
        buildWidgetTree(
          buildStripWidget(settingsFor('tr'), { width: 340, height: 70 }, now, false).light,
        ) as Tree,
      );
    expect(actions(new Date(2026, 10, 17))).toEqual(['OPEN_APP', 'TOGGLE_DONE']);
    expect(actions(new Date(2026, 9, 3))).toEqual(['OPEN_APP']);
  });

  it('layout, summary and label logic', async () => {
    const { stripLayoutFor, stripSummary, stripLabel } = await import('./StripWidget');
    const { widgetContentFor } = await import('./content');
    const { CHURCHES } = await import('../calendar');
    expect(stripLayoutFor(0).narrow).toBe(false);
    expect(stripLayoutFor(200).narrow).toBe(true);
    expect(stripLayoutFor(340).narrow).toBe(false);
    const fasting = widgetContentFor({ year: 2026, month: 11, day: 17 }, CHURCHES.greek, 'en');
    expect(stripSummary(fasting)).toBe(fasting.feast ?? fasting.levelShort);
    expect(stripLabel(fasting)).toContain(fasting.title);
    const free = widgetContentFor({ year: 2026, month: 10, day: 3 }, CHURCHES.greek, 'en');
    expect(stripSummary(free)).toBe(free.feast ?? free.labels.noFast);
  });
});
