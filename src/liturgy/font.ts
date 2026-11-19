// Font of the Church Slavonic text (titlo, combining accents, letters like ꙋ ѿ ѧ).
//
// Status: not wired. Loading a font file at run time needs the expo-font native module. It is not
// a dependency of this app (only a nested dependency of `expo`, so it cannot be imported), and
// adding it is a native change. Until a native build bundles a font, the text uses the system
// serif, which covers Cyrillic but not every Slavonic letter.
//
// To enable it in a native release: add an OFL font (Ponomar Unicode TT, SIL OFL) and its licence
// to assets/fonts/, bundle it natively (expo-font config plugin), and set the family name below.

import { SERIF } from '../ui/theme';

/** Family name of the bundled Slavonic font; null while none is bundled. */
export const SLAVONIC_FONT_FAMILY: string | null = null;

export function slavonicFontFamily(): string {
  return SLAVONIC_FONT_FAMILY ?? SERIF;
}
