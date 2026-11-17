import { describe, expect, it, vi } from 'vitest';

// The widget library needs a device for its native module; the tree builder is plain JS, so mock
// react-native and check that our elements walk without errors (no fragments, no null components).
vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Image: {},
  NativeModules: {},
  AppRegistry: { registerHeadlessTask: () => {} },
  TurboModuleRegistry: { getEnforcing: () => ({}) },
}));

// The package's TypeScript sources run as they are (its built files need the real RN runtime).
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

describe('fast widget tree', () => {
  it('builds for every size class, light and dark, with and without progress', async () => {
    const { buildWidgetTree } =
      await import('react-native-android-widget/src/api/build-widget-tree');
    const { buildFastWidget } = await import('./FastWidget');
    for (const language of ['tr', 'en', 'ru'] as const) {
      const settings = { language, churchId: 'greek', greekFish: 'unsure' } as const;
      for (const size of [
        { width: 110, height: 110 },
        { width: 170, height: 170 },
        { width: 320, height: 165 },
        { width: 340, height: 200 },
        { width: 300, height: 0 },
      ]) {
        for (const day of [new Date(2026, 10, 17), new Date(2026, 9, 3), new Date(2026, 11, 25)]) {
          for (const done of [false, true]) {
            const { light, dark } = buildFastWidget(settings, size, day, done);
            for (const element of [light, dark]) {
              const tree = buildWidgetTree(element);
              expect(tree.type).toBe('LinearLayoutWidget');
              expect(JSON.stringify(tree)).toContain('"clickAction":"OPEN_APP"');
            }
          }
        }
      }
    }
  });

  it('both layouts have the complete button', async () => {
    const { buildWidgetTree } =
      await import('react-native-android-widget/src/api/build-widget-tree');
    const { buildFastWidget } = await import('./FastWidget');
    const settings = { language: 'tr', churchId: 'greek', greekFish: 'unsure' } as const;
    const fastingDay = new Date(2026, 10, 17);
    const actions = (width: number, height: number, now: Date, done: boolean) =>
      clickActions(
        buildWidgetTree(buildFastWidget(settings, { width, height }, now, done).light) as Tree,
      );
    expect(actions(340, 200, fastingDay, false)).toEqual(['OPEN_APP', 'TOGGLE_DONE']);
    expect(actions(170, 170, fastingDay, false)).toEqual(['OPEN_APP', 'TOGGLE_DONE']);
    // No fast, no button: the card still opens the app.
    expect(actions(340, 200, new Date(2026, 9, 3), false)).toEqual(['OPEN_APP']);
  });

  it('the button label follows the done state', async () => {
    const { buildWidgetTree } =
      await import('react-native-android-widget/src/api/build-widget-tree');
    const { buildFastWidget } = await import('./FastWidget');
    const settings = { language: 'tr', churchId: 'greek', greekFish: 'unsure' } as const;
    const json = (done: boolean) =>
      JSON.stringify(
        buildWidgetTree(
          buildFastWidget(settings, { width: 340, height: 200 }, new Date(2026, 10, 17), done)
            .light,
        ),
      );
    expect(json(false)).toContain('Bugünü Tamamla');
    expect(json(false)).not.toContain('Tamamlandı');
    expect(json(true)).toContain('Tamamlandı');
    expect(json(true)).not.toContain('Bugünü Tamamla');
  });
});

describe('layoutFor', () => {
  it('picks wide for a roomy 4x2, compact otherwise', async () => {
    const { layoutFor } = await import('./FastWidget');
    expect(layoutFor(340, 200).wide).toBe(true);
    expect(layoutFor(340, 200).tight).toBe(false);
    expect(layoutFor(320, 165)).toEqual({ wide: true, tight: true, narrow: false, side: 0 });
    expect(layoutFor(340, 110).wide).toBe(false);
    expect(layoutFor(170, 170)).toEqual({ wide: false, tight: false, narrow: false, side: 170 });
    expect(layoutFor(110, 110)).toEqual({ wide: false, tight: true, narrow: true, side: 110 });
    // A wider-than-tall cell still gets a square card of the shorter edge.
    expect(layoutFor(180, 150).side).toBe(150);
    // An unknown height (0) is treated as roomy.
    expect(layoutFor(340, 0).wide).toBe(true);
  });
});
