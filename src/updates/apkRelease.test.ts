import { describe, expect, it } from 'vitest';
import { compareVersions, pickNewerApk } from './apkRelease';

const release = {
  tag_name: 'v0.2.0',
  draft: false,
  prerelease: false,
  assets: [
    { name: 'notes.txt', browser_download_url: 'https://example.com/notes.txt', size: 10 },
    {
      name: 'poreia-v0.2.0.apk',
      browser_download_url:
        'https://github.com/Kw4nzah/Poreia/releases/download/v0.2.0/poreia-v0.2.0.apk',
      size: 30_000_000,
    },
  ],
};

describe('compareVersions', () => {
  it('compares numerically, not as text', () => {
    expect(compareVersions('0.10.0', '0.9.3')).toBe(1);
    expect(compareVersions('v1.0', '1.0.0')).toBe(0);
    expect(compareVersions('0.1.0', '0.1.1')).toBe(-1);
    expect(compareVersions('0.6.1', '0.10.0')).toBe(-1);
    expect(compareVersions('v0.10.0', '0.6.1')).toBe(1);
  });

  it('a pre-release is older than its release and never newer than it', () => {
    expect(compareVersions('0.7.0-rc.1', '0.7.0')).toBe(-1);
    expect(compareVersions('0.7.0', '0.7.0-rc.1')).toBe(1);
    expect(compareVersions('v0.7.0-beta', '0.7.0')).toBe(-1);
    // A pre-release of a later version is still later than the earlier release.
    expect(compareVersions('0.7.0-rc.1', '0.6.9')).toBe(1);
    expect(compareVersions('0.7.0-rc.2', '0.7.0-rc.1')).toBe(0);
  });

  it('build metadata and stray whitespace do not count', () => {
    expect(compareVersions('0.7.0+build.5', '0.7.0')).toBe(0);
    expect(compareVersions(' v0.7.1 ', '0.7.0')).toBe(1);
  });

  it('text that is not a version is older than every real version', () => {
    expect(compareVersions('nightly', '0.0.1')).toBe(-1);
    expect(compareVersions('', '0.0.1')).toBe(-1);
  });
});

describe('pickNewerApk', () => {
  it('returns the APK of a newer release', () => {
    expect(pickNewerApk(release, '0.1.0')).toEqual({
      version: '0.2.0',
      url: 'https://github.com/Kw4nzah/Poreia/releases/download/v0.2.0/poreia-v0.2.0.apk',
      sizeBytes: 30_000_000,
    });
  });

  it('ignores the installed version, older ones, drafts and prereleases', () => {
    expect(pickNewerApk(release, '0.2.0')).toBeNull();
    expect(pickNewerApk(release, '1.0.0')).toBeNull();
    expect(pickNewerApk({ ...release, draft: true }, '0.1.0')).toBeNull();
    expect(pickNewerApk({ ...release, prerelease: true }, '0.1.0')).toBeNull();
  });

  it('does not offer a pre-release tag of the version already installed', () => {
    expect(pickNewerApk({ ...release, tag_name: 'v0.2.0-rc.1' }, '0.2.0')).toBeNull();
    expect(pickNewerApk({ ...release, tag_name: 'v0.2.0-rc.1' }, '0.1.0')).not.toBeNull();
  });

  it('returns null for releases without an APK or unexpected responses', () => {
    expect(pickNewerApk({ ...release, assets: [release.assets[0]] }, '0.1.0')).toBeNull();
    expect(pickNewerApk({ message: 'API rate limit exceeded' }, '0.1.0')).toBeNull();
    expect(pickNewerApk(null, '0.1.0')).toBeNull();
  });

  it('refuses an APK that is not hosted on this project releases', () => {
    const foreign = { name: 'p.apk', browser_download_url: 'https://example.com/p.apk', size: 1 };
    expect(pickNewerApk({ ...release, assets: [foreign] }, '0.1.0')).toBeNull();
  });
});
