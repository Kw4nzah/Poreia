// Font of the Church Slavonic text (titlo, combining accents, letters like ꙋ ѿ ѧ).
//
// Ponomar Unicode (SIL OFL 1.1) is embedded natively by the expo-font config plugin (see
// app.json, `assets/fonts/Ponomar-Regular.ttf`); on Android the family name is the file name
// without its extension. Only the Church Slavonic ('cu') blocks use it. The font ships with the
// native build (runtimeVersion 9 and later), so an older shell without it falls back to the
// system serif, which covers Cyrillic but not every Slavonic letter.

import { SERIF } from '../ui/theme';

/** Family name of the bundled Slavonic font. */
export const SLAVONIC_FONT_FAMILY: string | null = 'Ponomar-Regular';

export function slavonicFontFamily(): string {
  return SLAVONIC_FONT_FAMILY ?? SERIF;
}
