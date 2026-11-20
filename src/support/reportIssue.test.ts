import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES } from '../i18n';
import { isAllowedExternalUrl } from '../security/externalLinks';
import {
  NEW_ISSUE_URL,
  ReportTexts,
  buildBugReportUrl,
  buildReportUrl,
  cleanValue,
} from './reportIssue';

function texts(language: (typeof LANGUAGES)[number]): ReportTexts {
  const s = MESSAGES[language].support;
  return {
    title: s.reportTitle,
    what: s.reportWhat,
    write: s.reportWrite,
    details: s.reportDetails,
    app: s.reportApp,
    runtime: s.reportRuntime,
    android: s.reportAndroid,
    device: s.reportDevice,
    language: s.reportLanguage,
  };
}

const INFO = {
  appVersion: '0.7.0',
  runtimeVersion: '7',
  androidVersion: '14 (API 34)',
  deviceModel: 'Pixel 7',
  language: 'tr',
};

function params(url: string) {
  const query = new URL(url).searchParams;
  return { title: query.get('title') ?? '', body: query.get('body') ?? '' };
}

describe('buildReportUrl', () => {
  it.each(LANGUAGES)(
    '%s: a link the app is allowed to open, on the issues/new page',
    (language) => {
      const url = buildReportUrl(INFO, texts(language));
      expect(url.startsWith(`${NEW_ISSUE_URL}?title=`)).toBe(true);
      expect(isAllowedExternalUrl(url)).toBe(true);
    },
  );

  it.each(LANGUAGES)('%s: carries the five technical facts and nothing else', (language) => {
    const { title, body } = params(buildReportUrl(INFO, texts(language)));
    expect(title).toContain('0.7.0');
    for (const fact of ['0.7.0', '7', '14 (API 34)', 'Pixel 7', 'tr']) {
      expect(body).toContain(`: ${fact}`);
    }
    // Header, hint, details header and the five rows: no other lines of content.
    const lines = body.split('\n').filter((line) => line.trim() !== '');
    expect(lines).toHaveLength(8);
  });

  it('leaves out what is unavailable instead of printing a placeholder', () => {
    const { body } = params(
      buildReportUrl({ appVersion: '0.7.0', deviceModel: null, language: 'en' }, texts('en')),
    );
    expect(body).toContain('- App: 0.7.0');
    expect(body).toContain('- Language: en');
    expect(body).not.toMatch(/Device|Android|Content|null|undefined/);
  });

  it.each(LANGUAGES)('%s: stays within the link limit even with long values', (language) => {
    const long = 'x'.repeat(500);
    const url = buildReportUrl(
      { appVersion: long, runtimeVersion: long, androidVersion: long, deviceModel: long, language },
      texts(language),
    );
    expect(url.length).toBeLessThanOrEqual(2048);
    expect(isAllowedExternalUrl(url)).toBe(true);
  });

  it('falls back to a shorter body, then to the bare page, when the text is too long to encode', () => {
    const huge = { ...texts('ru'), write: 'Щ'.repeat(400) };
    const shorter = buildReportUrl(INFO, huge);
    expect(isAllowedExternalUrl(shorter)).toBe(true);
    expect(params(shorter).body).not.toContain('Щ');
    const hopeless = { ...texts('ru'), details: 'Щ'.repeat(400) };
    expect(buildReportUrl(INFO, hopeless)).toBe(NEW_ISSUE_URL);
  });

  it('drops characters that could smuggle markup or other text into the report', () => {
    const { body } = params(
      buildReportUrl(
        { ...INFO, deviceModel: 'Pixel\n## injected [x](http://evil.example) <b>', language: 'tr' },
        texts('en'),
      ),
    );
    expect(body).not.toMatch(/\[|\]|<|>|#.*injected/);
    expect(body.split('\n').filter((line) => line.startsWith('##'))).toHaveLength(2);
  });

  it('accepts only a two-letter language code', () => {
    const { body } = params(buildReportUrl({ ...INFO, language: 'tr; rm -rf' }, texts('en')));
    expect(body).not.toContain('Language');
  });
});

describe('cleanValue', () => {
  it('trims, collapses spaces, caps the length and rejects non-text', () => {
    expect(cleanValue('  Pixel   7  ')).toBe('Pixel 7');
    expect(cleanValue('a'.repeat(100), 10)).toBe('a'.repeat(10));
    expect(cleanValue('')).toBeNull();
    expect(cleanValue('###')).toBeNull();
    expect(cleanValue({})).toBeNull();
    expect(cleanValue(7)).toBe('7');
  });
});

describe('buildBugReportUrl', () => {
  const t = { ...texts('en'), steps: 'Before it', kind: 'Kind' };

  it('puts the user words, the kind and the technical details in the issue', () => {
    const url = buildBugReportUrl(INFO, t, {
      kind: 'Problem',
      text: 'Vespers stops halfway',
      steps: 'Opened Services',
    });
    expect(url).not.toBeNull();
    expect(isAllowedExternalUrl(url as string)).toBe(true);
    const q = new URL(url as string).searchParams;
    expect(q.get('title')).toContain('Vespers stops halfway');
    const body = q.get('body') as string;
    expect(body).toContain('Vespers stops halfway');
    expect(body).toContain('Opened Services');
    expect(body).toContain('Problem');
    expect(body).toContain('0.7.0');
  });

  it('has no link without text, and none when the words are too long', () => {
    expect(buildBugReportUrl(INFO, t, { kind: 'Problem', text: '   ' })).toBeNull();
    expect(buildBugReportUrl(INFO, t, { kind: 'Problem', text: 'ş'.repeat(900) })).toBeNull();
  });

  it('keeps Turkish and Russian words intact', () => {
    const url = buildBugReportUrl(INFO, t, { kind: 'Fikir', text: 'Akşam Ayını açılmıyor çö' });
    expect(new URL(url as string).searchParams.get('body')).toContain('Akşam Ayını açılmıyor çö');
  });
});

describe('bug report texts', () => {
  it.each(LANGUAGES)('%s has every text of the form', (language) => {
    const b = MESSAGES[language].bugReport;
    for (const value of [b.title, b.intro, b.send, b.tooLong, b.needText, b.issueWhat]) {
      expect(value.trim()).not.toBe('');
    }
    expect(b.kinds).toHaveLength(3);
  });
});
