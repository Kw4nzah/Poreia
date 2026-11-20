// Defensive parsing of a liturgy text asset (JSON). Anything unexpected throws, which the
// registry turns into "text not available" instead of a crash.
import { LITURGY_SECTIONS, LITURGY_SPEAKERS, type LiturgyBlock, type LiturgyData } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseLiturgyText(raw: string): LiturgyData {
  const json: unknown = JSON.parse(raw);
  if (!isRecord(json) || !Array.isArray(json.blocks) || !isRecord(json.source)) {
    throw new Error('liturgy text: bad shape');
  }
  const { tr, en, ru } = json.source;
  if (typeof tr !== 'string' || typeof en !== 'string' || typeof ru !== 'string') {
    throw new Error('liturgy text: bad source');
  }
  const blocks: LiturgyBlock[] = json.blocks.map((b: unknown) => {
    if (
      !isRecord(b) ||
      typeof b.id !== 'string' ||
      typeof b.text !== 'string' ||
      !(LITURGY_SECTIONS as readonly unknown[]).includes(b.section) ||
      !(LITURGY_SPEAKERS as readonly unknown[]).includes(b.who) ||
      (b.who !== 'omitted' && b.text.trim() === '')
    ) {
      throw new Error('liturgy text: bad block');
    }
    return b as unknown as LiturgyBlock;
  });
  if (blocks.length === 0) throw new Error('liturgy text: empty');
  return { blocks, source: { tr, en, ru } };
}
