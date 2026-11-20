// Font of the Church Slavonic text (titlo, combining accents, letters like ꙋ ѿ ѧ).
//
// Ponomar Unicode (SIL OFL 1.1) is embedded natively by the expo-font config plugin (see
// app.json, `assets/fonts/Ponomar-Regular.ttf`); on Android the family name is the file name
// without its extension. Only the Church Slavonic ('cu') blocks use it. The font ships with the
// native build (runtimeVersion 9 and later), so an older shell without it falls back to the
// system serif, which covers Cyrillic but not every Slavonic letter.

import { SERIF } from '../ui/theme';

/** Family name of the bundled Slavonic font. */
// The azbyka.ru Church Slavonic text is civil script without accents, which the system serif
// covers, so the font is no longer used. The file and the config plugin entry are removed at the
// next native release (a plain update cannot drop them from an installed APK).
export const SLAVONIC_FONT_FAMILY: string | null = null;

export function slavonicFontFamily(): string {
  return SLAVONIC_FONT_FAMILY ?? SERIF;
}
