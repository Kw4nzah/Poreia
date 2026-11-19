// Loads liturgy texts on demand and keeps them in memory while a screen uses them.

import { useEffect, useState } from 'react';
import { loadLiturgyText } from './registry';
import { LiturgyData, LiturgyId, LiturgyLanguage } from './types';

/** undefined: still loading; null: could not be loaded. */
export type LoadedTexts = Partial<Record<LiturgyLanguage, LiturgyData | null>>;

export function useLiturgyTexts(id: LiturgyId, wanted: readonly LiturgyLanguage[]): LoadedTexts {
  const [texts, setTexts] = useState<LoadedTexts>({});
  const key = wanted.join(',');

  useEffect(() => {
    let cancelled = false;
    for (const language of key === '' ? [] : (key.split(',') as LiturgyLanguage[])) {
      loadLiturgyText(id, language).then((data) => {
        if (!cancelled) setTexts((previous) => ({ ...previous, [language]: data }));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  return texts;
}
