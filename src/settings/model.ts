// What the app remembers about its user. Pure, so it can be tested without a device.

import { CHURCHES, ChurchId } from '../calendar';
import { Language, isLanguage } from '../i18n';

export interface Settings {
  language: Language;
  name: string;
  churchId: ChurchId;
  /** False until the user finishes the first-run questions. */
  onboarded: boolean;
}

export const STORAGE_KEY = 'poreia.settings.v1';

export function defaultSettings(language: Language): Settings {
  return { language, name: '', churchId: 'greek', onboarded: false };
}

function isChurchId(value: unknown): value is ChurchId {
  return typeof value === 'string' && value in CHURCHES;
}

/** Reads stored settings, replacing anything missing or invalid with defaults. */
export function parseSettings(raw: string | null, deviceLanguage: Language): Settings {
  const fallback = defaultSettings(deviceLanguage);
  if (!raw) return fallback;
  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!stored || typeof stored !== 'object') return fallback;
  const s = stored as Record<string, unknown>;
  return {
    language: isLanguage(s.language) ? s.language : fallback.language,
    name: typeof s.name === 'string' ? s.name : fallback.name,
    churchId: isChurchId(s.churchId) ? s.churchId : fallback.churchId,
    onboarded: s.onboarded === true && isChurchId(s.churchId),
  };
}
