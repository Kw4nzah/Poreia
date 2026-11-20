// Where the reader left off in each service, and which service was opened last. Pure: storage lives
// in progressStore.ts. Everything read from storage is untrusted.

import { LITURGY_IDS, LiturgyId } from './types';

/** Positions kept; the least recently read services are forgotten first. */
export const MAX_REMEMBERED = 100;
/** Largest block index kept; no service comes close. */
export const MAX_BLOCK_INDEX = 200_000;

export interface LiturgyProgress {
  /** The service opened last, with the first block that was on screen. */
  last: { id: LiturgyId; index: number } | null;
  /** Block index per service, least recently read first. */
  positions: Partial<Record<LiturgyId, number>>;
}

export const emptyProgress = (): LiturgyProgress => ({ last: null, positions: {} });

const isId = (value: unknown): value is LiturgyId => LITURGY_IDS.includes(value as LiturgyId);

function cleanIndex(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.round(Math.min(Math.max(n, 0), MAX_BLOCK_INDEX));
}

function capPositions(positions: Partial<Record<LiturgyId, number>>) {
  const ids = Object.keys(positions) as LiturgyId[];
  for (const drop of ids.slice(0, Math.max(0, ids.length - MAX_REMEMBERED))) {
    delete positions[drop];
  }
}

/** A well-formed progress record; unknown ids and junk are dropped. Never throws. */
export function cleanProgress(value: unknown): LiturgyProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyProgress();
  const { last, positions } = value as Record<string, unknown>;
  const out = emptyProgress();
  if (last && typeof last === 'object' && !Array.isArray(last)) {
    const { id, index } = last as Record<string, unknown>;
    if (isId(id)) out.last = { id, index: cleanIndex(index) };
  }
  if (positions && typeof positions === 'object' && !Array.isArray(positions)) {
    for (const [id, index] of Object.entries(positions).slice(0, MAX_REMEMBERED * 4)) {
      if (isId(id)) out.positions[id] = cleanIndex(index);
    }
    capPositions(out.positions);
  }
  return out;
}

/** Parses the stored JSON text; empty progress when it is missing or broken. */
export function parseProgress(raw: string | null): LiturgyProgress {
  if (!raw) return emptyProgress();
  try {
    return cleanProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

/** Records that `index` is the first block on screen in service `id`; returns a new record. */
export function recordPosition(
  progress: LiturgyProgress,
  id: LiturgyId,
  index: number,
): LiturgyProgress {
  const clean = cleanIndex(index);
  const positions = { ...progress.positions };
  // Delete first so the entry moves to the "most recent" end.
  delete positions[id];
  positions[id] = clean;
  capPositions(positions);
  return { last: { id, index: clean }, positions };
}

/** Block to scroll to when opening `id`, kept inside a text of `length` blocks (0 = start). */
export function restoreIndex(progress: LiturgyProgress, id: LiturgyId, length: number): number {
  const index = progress.positions[id] ?? 0;
  if (length <= 0) return 0;
  return Math.min(index, length - 1);
}
