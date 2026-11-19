// Which liturgy texts exist and how to load them. A language counts as available only when a
// loader is registered for it in src/liturgy/data/index.ts, so the feature stays hidden until a
// data file is added.

import { LOADERS } from './data';
import {
  LITURGY_IDS,
  LITURGY_LANGUAGES,
  LiturgyData,
  LiturgyId,
  LiturgyLanguage,
  LiturgyLoaders,
} from './types';

export function isLiturgyId(value: unknown): value is LiturgyId {
  return LITURGY_IDS.includes(value as LiturgyId);
}

/** Languages this liturgy has text in, in the fixed order cu, en, tr. */
export function getAvailableLanguages(
  id: LiturgyId,
  loaders: LiturgyLoaders = LOADERS,
): LiturgyLanguage[] {
  const own = loaders[id] ?? {};
  return LITURGY_LANGUAGES.filter((language) => typeof own[language] === 'function');
}

/** Liturgies with at least one language of text. */
export function getAvailableLiturgies(loaders: LiturgyLoaders = LOADERS): LiturgyId[] {
  return LITURGY_IDS.filter((id) => getAvailableLanguages(id, loaders).length > 0);
}

/**
 * The language to open in: a Russian reader gets Church Slavonic first, anyone else their own
 * language, otherwise the first available.
 */
export function defaultLiturgyLanguage(
  available: readonly LiturgyLanguage[],
  appLanguage: string,
): LiturgyLanguage | null {
  const preferred: LiturgyLanguage[] = appLanguage === 'ru' ? ['cu'] : [];
  if (appLanguage === 'en' || appLanguage === 'tr') preferred.push(appLanguage);
  return preferred.find((language) => available.includes(language)) ?? available[0] ?? null;
}

/** The language shown under the main one in two-language mode; null when there is no other. */
export function secondLanguage(
  available: readonly LiturgyLanguage[],
  main: LiturgyLanguage,
): LiturgyLanguage | null {
  return available.find((language) => language !== main) ?? null;
}

/** Loads one language's text; null when it is not available or fails to load. */
export async function loadLiturgyText(
  id: LiturgyId,
  language: LiturgyLanguage,
  loaders: LiturgyLoaders = LOADERS,
): Promise<LiturgyData | null> {
  const load = loaders[id]?.[language];
  if (!load) return null;
  try {
    return await load();
  } catch {
    return null;
  }
}
