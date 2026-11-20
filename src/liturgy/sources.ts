// The source lines that live with the liturgy texts, for the Sources screen.

import { useEffect, useState } from 'react';
import { getAvailableLanguages, getAvailableLiturgies, loadLiturgyText } from './registry';
import { LITURGY_GROUP_OF, LiturgyLanguage, LiturgySource } from './types';

export interface LiturgySourceLine {
  language: LiturgyLanguage;
  source: string;
}

/** Source line in the app language, for each text that exists; empty while none does. */
export function sourceLines(
  entries: readonly { language: LiturgyLanguage; source: LiturgySource }[],
  appLanguage: keyof LiturgySource,
): LiturgySourceLine[] {
  return entries
    .map((entry) => ({ language: entry.language, source: entry.source[appLanguage].trim() }))
    .filter((line) => line.source !== '');
}

export function useLiturgySources(appLanguage: keyof LiturgySource): LiturgySourceLine[] {
  const [lines, setLines] = useState<LiturgySourceLine[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries: { language: LiturgyLanguage; source: LiturgySource }[] = [];
      // The other services share one credit line (m.liturgy.azbykaCredit).
      for (const id of getAvailableLiturgies().filter((x) => LITURGY_GROUP_OF[x] === 'liturgies')) {
        for (const language of getAvailableLanguages(id)) {
          const data = await loadLiturgyText(id, language);
          if (data) entries.push({ language, source: data.source });
        }
      }
      if (!cancelled) setLines(sourceLines(entries, appLanguage));
    })();
    return () => {
      cancelled = true;
    };
  }, [appLanguage]);

  return lines;
}
