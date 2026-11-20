import { describe, expect, it } from 'vitest';
import { LANGUAGES } from './i18n';
import { RELEASE_NOTES, isInstalledVersion, releaseNotesFor } from './releaseNotes';
import { compareVersions } from './updates/apkRelease';

describe('release notes', () => {
  it('has every version in all three languages with non-empty lines', () => {
    for (const { version, notes } of RELEASE_NOTES) {
      for (const language of LANGUAGES) {
        expect(notes[language].length, `${version} ${language}`).toBeGreaterThan(0);
        for (const line of notes[language]) {
          expect(line.trim(), `${version} ${language}`).not.toBe('');
        }
      }
      // The same number of lines everywhere keeps the three languages in step.
      expect(notes.tr.length, version).toBe(notes.en.length);
      expect(notes.ru.length, version).toBe(notes.en.length);
    }
  });

  it('lists versions newest first, without duplicates', () => {
    const versions = RELEASE_NOTES.map((note) => note.version);
    expect(new Set(versions).size).toBe(versions.length);
    for (let i = 1; i < versions.length; i++) {
      expect(compareVersions(versions[i - 1], versions[i]), versions[i]).toBeGreaterThan(0);
    }
  });

  it('covers 0.4.0 to 0.9.10 and uses plain x.y.z versions', () => {
    const versions = RELEASE_NOTES.map((note) => note.version);
    expect(versions[0]).toBe('0.9.10');
    expect(versions[versions.length - 1]).toBe('0.4.0');
    for (const version of versions) expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('returns the notes of the chosen language in the same order', () => {
    for (const language of LANGUAGES) {
      expect(releaseNotesFor(language).map((note) => note.version)).toEqual(
        RELEASE_NOTES.map((note) => note.version),
      );
    }
    expect(releaseNotesFor('en')[0].notes).toBe(RELEASE_NOTES[0].notes.en);
  });

  it('recognises the installed version', () => {
    expect(isInstalledVersion('0.7.0', '0.7.0')).toBe(true);
    expect(isInstalledVersion('0.7.0', '0.7.0-rc.1')).toBe(true);
    expect(isInstalledVersion('0.7.0', '0.6.1')).toBe(false);
    expect(isInstalledVersion('0.7.0', null)).toBe(false);
  });
});
