import { describe, expect, it } from 'vitest';
import { compareVersions, pickNewerApk } from './apkRelease';

const release = {
  tag_name: 'v0.2.0',
  draft: false,
  prerelease: false,
  assets: [
    { name: 'notes.txt', browser_download_url: 'https://example.com/notes.txt', size: 10 },
    { name: 'poreia-v0.2.0.apk', browser_download_url: 'https://example.com/p.apk', size: 30_000_000 },
  ],
};

describe('compareVersions', () => {
  it('compares numerically, not as text', () => {
    expect(compareVersions('0.10.0', '0.9.3')).toBe(1);
    expect(compareVersions('v1.0', '1.0.0')).toBe(0);
    expect(compareVersions('0.1.0', '0.1.1')).toBe(-1);
  });
});

describe('pickNewerApk', () => {
  it('returns the APK of a newer release', () => {
    expect(pickNewerApk(release, '0.1.0')).toEqual({
      version: '0.2.0',
      url: 'https://example.com/p.apk',
      sizeBytes: 30_000_000,
    });
  });

  it('ignores the installed version, older ones, drafts and prereleases', () => {
    expect(pickNewerApk(release, '0.2.0')).toBeNull();
    expect(pickNewerApk(release, '1.0.0')).toBeNull();
    expect(pickNewerApk({ ...release, draft: true }, '0.1.0')).toBeNull();
    expect(pickNewerApk({ ...release, prerelease: true }, '0.1.0')).toBeNull();
  });

  it('returns null for releases without an APK or unexpected responses', () => {
    expect(pickNewerApk({ ...release, assets: [release.assets[0]] }, '0.1.0')).toBeNull();
    expect(pickNewerApk({ message: 'API rate limit exceeded' }, '0.1.0')).toBeNull();
    expect(pickNewerApk(null, '0.1.0')).toBeNull();
  });
});
