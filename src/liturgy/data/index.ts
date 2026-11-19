// Registry of the liturgy text files. Empty until texts are added; the Divine Liturgy entry is
// hidden while it is.
//
// To add a text, create src/liturgy/data/<liturgy>.<language>.ts (for example
// chrysostom.cu.ts) exporting
//   export const blocks: readonly LiturgyBlock[] = [{ id, section, who, text }, ...];
//   export const source = { tr: '...', en: '...', ru: '...' };
// and register it here, e.g.
//   chrysostom: { cu: () => import('./chrysostom.cu') },
// Block ids must be the same in every language so the parallel view can align them.

import type { LiturgyLoaders } from '../types';

export const LOADERS: LiturgyLoaders = {};
