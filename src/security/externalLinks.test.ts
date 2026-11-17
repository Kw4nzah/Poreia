import { describe, expect, it } from 'vitest';
import { readingUrl } from '../commemorations/links';
import { PROJECT_URL } from './constants';
import { isAllowedApkUrl, isAllowedExternalUrl } from './externalLinks';

describe('isAllowedExternalUrl', () => {
  it('accepts https links to the allowed hosts', () => {
    expect(isAllowedExternalUrl('https://www.bible.com/bible/400/MAT.5.1.SYNO')).toBe(true);
    expect(isAllowedExternalUrl('https://bible.com/bible/400/PSA.50.SYNO')).toBe(true);
    expect(isAllowedExternalUrl('HTTPS://GitHub.com/Kw4nzah/Poreia?tab=readme#top')).toBe(true);
    expect(isAllowedExternalUrl('https://github.com:443/Kw4nzah/Poreia')).toBe(true);
  });

  it('accepts the project link and every reading link the app can build', () => {
    expect(isAllowedExternalUrl(PROJECT_URL)).toBe(true);
    for (const language of ['tr', 'en', 'ru'] as const) {
      const url = readingUrl({ kind: 'other', source: 'x', runs: [['MAT', 5, 1, 5, 3]] }, language);
      expect(url).not.toBeNull();
      expect(isAllowedExternalUrl(url)).toBe(true);
    }
  });

  it('rejects other schemes', () => {
    for (const url of [
      'http://github.com/x',
      'intent://scan/#Intent;scheme=zxing;end',
      'file:///data/data/com.kw4nzah.poreia/files/x',
      'content://com.android.contacts/contacts',
      'javascript:alert(1)',
      'tel:+900000000',
      'market://details?id=x',
      'poreia://home',
      '//github.com/x',
      'github.com/x',
    ]) {
      expect(isAllowedExternalUrl(url)).toBe(false);
    }
  });

  it('rejects other hosts and look-alikes', () => {
    for (const url of [
      'https://evil.example/',
      'https://github.com.evil.example/',
      'https://evilgithub.com/',
      'https://sub.github.com/',
      'https://github.com@evil.example/',
      'https://evil.example@github.com/',
      'https://github.com:8443/x',
      'https://github.com:pw@evil.example/',
      'https://github.com\\@evil.example/',
      'https://github.com/x\\y',
      'https://github.com evil.example/',
      'https://github.com/x y',
      'https://github.com/\nx',
      'https://github.com./x',
      'https://[::1]/',
      'https://',
    ]) {
      expect(isAllowedExternalUrl(url)).toBe(false);
    }
  });

  it('rejects non-strings and very long values', () => {
    for (const value of [undefined, null, 5, {}, [], '']) {
      expect(isAllowedExternalUrl(value)).toBe(false);
    }
    expect(isAllowedExternalUrl(`https://github.com/${'a'.repeat(3000)}`)).toBe(false);
  });
});

describe('isAllowedApkUrl', () => {
  const ok = 'https://github.com/Kw4nzah/Poreia/releases/download/v0.5.0/poreia-v0.5.0.apk';

  it('accepts an APK attached to a release of this project', () => {
    expect(isAllowedApkUrl(ok)).toBe(true);
  });

  it('rejects other repositories, hosts, schemes and file types', () => {
    expect(isAllowedApkUrl(ok.replace('Kw4nzah/Poreia', 'evil/Poreia'))).toBe(false);
    expect(isAllowedApkUrl(ok.replace('github.com', 'evil.example'))).toBe(false);
    expect(isAllowedApkUrl(ok.replace('https', 'http'))).toBe(false);
    expect(isAllowedApkUrl(ok.replace('.apk', '.zip'))).toBe(false);
    expect(isAllowedApkUrl('https://github.com/Kw4nzah/Poreia/archive/main.apk')).toBe(false);
    expect(isAllowedApkUrl(ok.replace('v0.5.0/', '../../'))).toBe(false);
    expect(isAllowedApkUrl(undefined)).toBe(false);
  });
});
