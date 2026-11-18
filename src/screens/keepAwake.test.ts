import { beforeEach, describe, expect, it, vi } from 'vitest';

const activate = vi.fn();
const deactivate = vi.fn();
vi.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: (tag: string) => activate(tag),
  deactivateKeepAwake: (tag: string) => deactivate(tag),
}));

import { holdScreenAwake } from './keepAwake';

beforeEach(() => {
  activate.mockReset().mockResolvedValue(undefined);
  deactivate.mockReset().mockResolvedValue(undefined);
});

describe('holdScreenAwake', () => {
  it('activates under a tag and releases the same tag', () => {
    const release = holdScreenAwake();
    expect(activate).toHaveBeenCalledTimes(1);
    expect(deactivate).not.toHaveBeenCalled();
    release();
    expect(deactivate).toHaveBeenCalledWith(activate.mock.calls[0][0]);
  });

  it('ignores a rejected request and a rejected release', async () => {
    activate.mockRejectedValue(new Error('no activity'));
    deactivate.mockRejectedValue(new Error('no activity'));
    const release = holdScreenAwake();
    expect(() => release()).not.toThrow();
    await Promise.resolve();
  });

  it('ignores a native module that throws at once', () => {
    activate.mockImplementation(() => {
      throw new Error('missing module');
    });
    deactivate.mockImplementation(() => {
      throw new Error('missing module');
    });
    let release: () => void = () => {};
    expect(() => (release = holdScreenAwake())).not.toThrow();
    expect(() => release()).not.toThrow();
  });
});
