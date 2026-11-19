// Pure helpers over liturgy blocks.

import { LITURGY_SECTIONS, LiturgyBlock, LiturgySection, LiturgySpeaker } from './types';

/** A block in two languages; a side is null where that language has no block with this id. */
export interface AlignedBlock {
  id: string;
  section: LiturgySection;
  who: LiturgySpeaker;
  a: LiturgyBlock | null;
  b: LiturgyBlock | null;
}

/**
 * Aligns two texts by block id. The order follows `a`; blocks only `b` has are placed after the
 * block that precedes them in `b` (or first, if none does). Missing blocks stay null.
 */
export function alignBlocks(
  a: readonly LiturgyBlock[],
  b: readonly LiturgyBlock[],
): AlignedBlock[] {
  const byIdA = new Map(a.map((block) => [block.id, block]));
  const byIdB = new Map(b.map((block) => [block.id, block]));
  // Blocks only `b` has, grouped under the id of the shared block before them ('' = at the start).
  const extra = new Map<string, LiturgyBlock[]>();
  let anchor = '';
  for (const block of b) {
    if (byIdA.has(block.id)) {
      anchor = block.id;
    } else {
      extra.set(anchor, [...(extra.get(anchor) ?? []), block]);
    }
  }
  const out: AlignedBlock[] = [];
  const pushExtra = (key: string) => {
    for (const block of extra.get(key) ?? []) {
      out.push({ id: block.id, section: block.section, who: block.who, a: null, b: block });
    }
  };
  pushExtra('');
  for (const block of a) {
    out.push({
      id: block.id,
      section: block.section,
      who: block.who,
      a: block,
      b: byIdB.get(block.id) ?? null,
    });
    pushExtra(block.id);
  }
  return out;
}

/** The sections a text has blocks in, in service order. */
export function sectionsOf(blocks: readonly { section: LiturgySection }[]): LiturgySection[] {
  const present = new Set(blocks.map((block) => block.section));
  return LITURGY_SECTIONS.filter((section) => present.has(section));
}

/** Index of the first block of each section present; used to jump between sections. */
export function sectionStarts(
  blocks: readonly { section: LiturgySection }[],
): Partial<Record<LiturgySection, number>> {
  const starts: Partial<Record<LiturgySection, number>> = {};
  blocks.forEach((block, index) => {
    if (starts[block.section] === undefined) starts[block.section] = index;
  });
  return starts;
}

/**
 * Key into `messages.liturgy.speaker` for a block's label, or null where none is shown
 * (a rubric is told apart by its italics instead).
 */
export function speakerLabelKey(who: LiturgySpeaker): LiturgySpeaker | null {
  return who === 'rubric' ? null : who;
}
