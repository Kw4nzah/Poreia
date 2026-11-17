import { describe, expect, it, vi } from 'vitest';

// The widget library needs a device for its native module; the tree builder is plain JS, so mock
// react-native and check that our elements walk without errors (no fragments, no null components).
vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
  NativeModules: {},
  AppRegistry: { registerHeadlessTask: () => {} },
  TurboModuleRegistry: { getEnforcing: () => ({}) },
}));

// The package's TypeScript sources run as they are (its built files need the real RN runtime).
vi.mock('react-native-android-widget', async () => ({
  ...(await import('react-native-android-widget/src/widgets/FlexWidget')),
  ...(await import('react-native-android-widget/src/widgets/TextWidget')),
}));

describe('fast widget tree', () => {
  it('builds for wide and small sizes, light and dark, with and without progress', async () => {
    const { buildWidgetTree } = await import('react-native-android-widget/src/api/build-widget-tree');
    const { buildFastWidget } = await import('./FastWidget');
    const settings = { language: 'tr', churchId: 'greek', greekFish: 'unsure' } as const;
    for (const width of [110, 300]) {
      for (const day of [new Date(2026, 10, 17), new Date(2026, 9, 3), new Date(2026, 11, 25)]) {
        const { light, dark } = buildFastWidget(settings, width, day);
        for (const element of [light, dark]) {
          const tree = buildWidgetTree(element);
          expect(tree.type).toBe('LinearLayoutWidget');
          expect(JSON.stringify(tree)).toContain('"clickAction":"OPEN_APP"');
        }
      }
    }
  });
});
