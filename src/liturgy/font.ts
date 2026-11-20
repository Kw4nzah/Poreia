// Font of the Church Slavonic text. The azbyka.ru text is civil script without accents, which
// the serif font covers, so no dedicated Slavonic font is bundled.

import { SERIF } from '../ui/theme';

export function slavonicFontFamily(): string {
  return SERIF;
}
