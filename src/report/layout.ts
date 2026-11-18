// Layout arithmetic of the report pages. Pure, so it can be tested without a device.

/** Widest a serif glyph gets, as a share of the font size (capital Cyrillic and Turkish letters). */
const GLYPH_EM = 0.6;
/** How far the system font size may grow the report's big titles (their `maxFontSizeMultiplier`). */
export const TITLE_MAX_FONT_SCALE = 1.2;

/**
 * Font size for a big title so that its longest word fits `available` dp on one line, whatever the
 * language and the system font size. A long word ("Рождественский") would otherwise be broken in
 * the middle on a narrow phone. Never above `max`, never below `min`.
 */
export function titleFontSize(
  text: string,
  available: number,
  fontScale: number,
  max = 44,
  min = 24,
): number {
  const longest = Math.max(1, ...text.split(/\s+/).map((word) => word.length));
  const scale = Math.min(Math.max(fontScale, 1), TITLE_MAX_FONT_SCALE);
  const fit = Math.floor(available / (longest * GLYPH_EM * scale));
  return Math.max(min, Math.min(max, fit));
}
