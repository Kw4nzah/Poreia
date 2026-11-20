// Loads the full-text search indexes from their asset files (assets/liturgy-index/*.ltxt) the first
// time they are needed, so neither the JS bundle nor the app start pays for them.
import { readAssetText } from './assetLoader';
import { SEARCH_INDEX_ASSETS } from './data/searchIndex';
import { parseSearchIndex, type TextSearchIndex } from './textSearch';

let pending: Promise<TextSearchIndex[]> | null = null;

/** All available language indexes, loaded once. A file that fails to load is skipped; a total
 * failure is not cached, so the next search tries again. */
export function loadSearchIndexes(): Promise<TextSearchIndex[]> {
  if (!pending) {
    const attempt = Promise.all(
      (Object.values(SEARCH_INDEX_ASSETS) as number[]).map((moduleId) =>
        readAssetText(moduleId).then(parseSearchIndex).catch(() => null),
      ),
    ).then((all) => {
      const ok = all.filter((index): index is TextSearchIndex => index !== null);
      if (ok.length === 0) pending = null;
      return ok;
    });
    pending = attempt;
  }
  return pending;
}
