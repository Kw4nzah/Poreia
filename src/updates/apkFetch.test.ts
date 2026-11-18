import { describe, expect, it } from 'vitest';
import { ApkFiles, DownloadedApk, fetchApk } from './apkFetch';
import type { ApkRelease } from './apkRelease';

const release: ApkRelease = {
  version: '0.7.0',
  url: 'https://github.com/Kw4nzah/Poreia/releases/download/v0.7.0/poreia-v0.7.0.apk',
  sizeBytes: 1000,
};

function fakeFiles(download: ApkFiles['download']) {
  const log: string[] = [];
  const files: ApkFiles = {
    discard: () => void log.push('discard'),
    download,
  };
  return { files, log };
}

const done = (size: number | null = 1000): Promise<DownloadedApk> =>
  Promise.resolve({ uri: 'content://apk', size });

describe('fetchApk', () => {
  it('hands back the file of a complete download, after clearing the old one', async () => {
    const { files, log } = fakeFiles(() => done());
    const result = await fetchApk(release, new AbortController().signal, files, () => {});
    expect(result).toEqual({ ok: true, uri: 'content://apk' });
    expect(log).toEqual(['discard']);
  });

  it('reports progress while it runs', async () => {
    const seen: [number, number | null][] = [];
    const { files } = fakeFiles(async (_url, _signal, onProgress) => {
      onProgress(100, 1000);
      onProgress(500, null);
      return done();
    });
    await fetchApk(release, new AbortController().signal, files, (w, t) => seen.push([w, t]));
    expect(seen).toEqual([
      [100, 1000],
      [500, null],
    ]);
  });

  it('a cancel during the download is cancelled, not failed, and removes the partial file', async () => {
    const controller = new AbortController();
    const { files, log } = fakeFiles(
      (_url, signal) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const pending = fetchApk(release, controller.signal, files, () => {});
    controller.abort();
    expect(await pending).toEqual({ ok: false, reason: 'cancelled' });
    expect(log).toEqual(['discard', 'discard']);
  });

  it('a cancel that lands as the download completes still cancels: no installer afterwards', async () => {
    const controller = new AbortController();
    const { files, log } = fakeFiles(async () => {
      controller.abort(); // the user taps Cancel just as the last byte arrives
      return { uri: 'content://apk', size: 1000 };
    });
    expect(await fetchApk(release, controller.signal, files, () => {})).toEqual({
      ok: false,
      reason: 'cancelled',
    });
    expect(log).toEqual(['discard', 'discard']);
  });

  it('a network error is failed and removes the partial file', async () => {
    const { files, log } = fakeFiles(() => Promise.reject(new Error('offline')));
    expect(await fetchApk(release, new AbortController().signal, files, () => {})).toEqual({
      ok: false,
      reason: 'failed',
    });
    expect(log).toEqual(['discard', 'discard']);
  });

  it('a cut-off file (size differs from the release listing) is failed and removed', async () => {
    const { files, log } = fakeFiles(() => done(400));
    expect(await fetchApk(release, new AbortController().signal, files, () => {})).toEqual({
      ok: false,
      reason: 'failed',
    });
    expect(log).toEqual(['discard', 'discard']);
  });

  it('does not judge the size when the listing or the disk does not say', async () => {
    const unknownExpected = { ...release, sizeBytes: 0 };
    const a = fakeFiles(() => done(123));
    expect(
      await fetchApk(unknownExpected, new AbortController().signal, a.files, () => {}),
    ).toMatchObject({ ok: true });
    const b = fakeFiles(() => done(null));
    expect(await fetchApk(release, new AbortController().signal, b.files, () => {})).toMatchObject({
      ok: true,
    });
  });

  it('refuses a URL outside this project releases without touching the network', async () => {
    let called = false;
    const { files } = fakeFiles(() => {
      called = true;
      return done();
    });
    const foreign = { ...release, url: 'https://example.com/poreia.apk' };
    expect(await fetchApk(foreign, new AbortController().signal, files, () => {})).toEqual({
      ok: false,
      reason: 'failed',
    });
    expect(called).toBe(false);
  });

  it('a file that cannot be removed does not turn a cancel into a crash', async () => {
    const controller = new AbortController();
    const files: ApkFiles = {
      discard: () => {
        throw new Error('locked');
      },
      download: () => Promise.reject(new Error('aborted')),
    };
    controller.abort();
    expect(await fetchApk(release, controller.signal, files, () => {})).toEqual({
      ok: false,
      reason: 'cancelled',
    });
  });

  it('a signal that is already aborted never starts the download', async () => {
    let started = false;
    const controller = new AbortController();
    controller.abort();
    const { files } = fakeFiles(() => {
      started = true;
      return done();
    });
    const result = await fetchApk(release, controller.signal, files, () => {});
    expect(result).toEqual({ ok: false, reason: 'cancelled' });
    expect(started).toBe(false);
  });
});
