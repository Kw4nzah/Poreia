import { describe, expect, it } from 'vitest';
import { alignBlocks, sectionStarts, sectionsOf, speakerLabelKey } from './blocks';
import {
  defaultLiturgyLanguage,
  getAvailableLanguages,
  getAvailableLiturgies,
  loadLiturgyText,
  secondLanguage,
} from './registry';
import { sourceLines } from './sources';
import { LiturgyBlock, LiturgyData, LiturgyLoaders } from './types';

const block = (id: string, section: LiturgyBlock['section'] = 'faithful'): LiturgyBlock => ({
  id,
  section,
  who: 'priest',
  text: `Block ${id}`,
});

const data: LiturgyData = {
  blocks: [block('one')],
  source: { tr: 'Source tr', en: 'Source en', ru: 'Source ru' },
};

describe('registry', () => {
  it('has no language and no liturgy when nothing is registered', () => {
    expect(getAvailableLanguages('chrysostom', {})).toEqual([]);
    expect(getAvailableLiturgies({})).toEqual([]);
  });

  it('lists registered languages in the fixed order', () => {
    const loaders: LiturgyLoaders = {
      chrysostom: { tr: async () => data, cu: async () => data },
    };
    expect(getAvailableLanguages('chrysostom', loaders)).toEqual(['cu', 'tr']);
    expect(getAvailableLiturgies(loaders)).toEqual(['chrysostom']);
  });

  it('loads a text, and returns null for a missing or failing one', async () => {
    const loaders: LiturgyLoaders = {
      chrysostom: {
        en: async () => data,
        tr: async () => {
          throw new Error('broken');
        },
      },
    };
    expect(await loadLiturgyText('chrysostom', 'en', loaders)).toBe(data);
    expect(await loadLiturgyText('chrysostom', 'tr', loaders)).toBeNull();
    expect(await loadLiturgyText('chrysostom', 'cu', loaders)).toBeNull();
  });

  it('ships with the Church Slavonic Chrysostom text registered', () => {
    expect(getAvailableLiturgies()).toEqual(['chrysostom']);
    expect(getAvailableLanguages('chrysostom')).toEqual(['cu']);
  });
});

describe('language choice', () => {
  it('opens a Russian reader in Church Slavonic when there is one', () => {
    expect(defaultLiturgyLanguage(['cu', 'en'], 'ru')).toBe('cu');
    expect(defaultLiturgyLanguage(['en', 'tr'], 'ru')).toBe('en');
  });

  it('prefers the app language, then the first available', () => {
    expect(defaultLiturgyLanguage(['cu', 'en', 'tr'], 'tr')).toBe('tr');
    expect(defaultLiturgyLanguage(['cu', 'en'], 'tr')).toBe('cu');
    expect(defaultLiturgyLanguage([], 'en')).toBeNull();
  });

  it('picks another language for two-language mode', () => {
    expect(secondLanguage(['cu', 'en', 'tr'], 'cu')).toBe('en');
    expect(secondLanguage(['cu', 'en'], 'en')).toBe('cu');
    expect(secondLanguage(['en'], 'en')).toBeNull();
  });
});

describe('sourceLines', () => {
  it('uses the app language and drops empty lines', () => {
    const lines = sourceLines(
      [
        { language: 'cu', source: { tr: '', en: 'Source en', ru: 'Source ru' } },
        { language: 'tr', source: { tr: ' ', en: 'Other en', ru: '' } },
      ],
      'en',
    );
    expect(lines).toEqual([
      { language: 'cu', source: 'Source en' },
      { language: 'tr', source: 'Other en' },
    ]);
    expect(sourceLines([{ language: 'cu', source: { tr: '', en: 'x', ru: '' } }], 'ru')).toEqual(
      [],
    );
  });
});

describe('alignBlocks', () => {
  it('pairs blocks by id', () => {
    const rows = alignBlocks([block('1'), block('2')], [block('1'), block('2')]);
    expect(rows.map((row) => [row.id, row.a?.id, row.b?.id])).toEqual([
      ['1', '1', '1'],
      ['2', '2', '2'],
    ]);
  });

  it('leaves the missing side null', () => {
    const rows = alignBlocks([block('1'), block('2')], [block('2')]);
    expect(rows[0].b).toBeNull();
    expect(rows[1].b?.id).toBe('2');
  });

  it('places blocks only the second text has after their predecessor', () => {
    const rows = alignBlocks(
      [block('1'), block('3')],
      [block('0'), block('1'), block('2'), block('3')],
    );
    expect(rows.map((row) => row.id)).toEqual(['0', '1', '2', '3']);
    expect(rows[0].a).toBeNull();
    expect(rows[2].a).toBeNull();
  });

  it('handles an empty side', () => {
    expect(alignBlocks([], [])).toEqual([]);
    expect(alignBlocks([block('1')], []).map((row) => row.b)).toEqual([null]);
    expect(alignBlocks([], [block('1')]).map((row) => row.a)).toEqual([null]);
  });
});

describe('sections', () => {
  const blocks = [block('1', 'catechumens'), block('2', 'catechumens'), block('3', 'dismissal')];

  it('lists the sections present, in service order', () => {
    expect(sectionsOf([...blocks].reverse())).toEqual(['catechumens', 'dismissal']);
  });

  it('finds the first block of each section', () => {
    expect(sectionStarts(blocks)).toEqual({ catechumens: 0, dismissal: 2 });
  });
});

describe('speakerLabelKey', () => {
  it('labels every speaker but a rubric', () => {
    expect(speakerLabelKey('deacon')).toBe('deacon');
    expect(speakerLabelKey('omitted')).toBe('omitted');
    expect(speakerLabelKey('rubric')).toBeNull();
  });
});
