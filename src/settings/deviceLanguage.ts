import { getLocales } from 'expo-localization';
import { Language, pickLanguage } from '../i18n';

/** First supported device language; English when the locale module fails or is missing. */
export function deviceLanguage(): Language {
  try {
    return pickLanguage(getLocales().map((locale) => locale.languageCode));
  } catch {
    return pickLanguage([]);
  }
}
