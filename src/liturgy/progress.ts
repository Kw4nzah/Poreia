// Where the reader left off in each service, how far they got, the bookmark they set by hand, and
// which service was opened last. Pure: storage lives in progressStore.ts. Everything read from
// storage is untrusted.

import { LITURGY_IDS, LiturgyId } from './types';

/** Positions kept; the least recently read services are forgotten first. */
export const MAX_REMEMBERED = 100;
/** Largest block index kept; no service comes close. */
export const MAX_BLOCK_INDEX = 200_000;
/** Longest snippet kept per position or bookmark, in characters (ellipsis included). */
export const SNIPPET_LENGTH = 70;

/** What is remembered about one service besides where the reader is now. */
export interface ServiceDetail {
  /** Furthest block that has been on screen. */
  furthest: number;
  /** Number of blocks in the text when it was last read (0 = unknown). */
  length: number;
  /** Start of the block the reader stopped at, for the list (so it never loads the text). */
  snippet: string;
  /** The place the reader marked by hand, if any. */
  bookmark: { index: number; snippet: string } | null;
}

export interface LiturgyProgress {
  /** The service opened last, with the first block that was on screen. */
  last: { id: LiturgyId; index: number } | null;
  /** Block index per service, least recently read first. */
  positions: Partial<Record<LiturgyId, number>>;
  /** Furthest block, length, snippets and bookmark per service, least recently read first. */
  details: Partial<Record<LiturgyId, ServiceDetail>>;
}

export const emptyProgress = (): LiturgyProgress => ({ last: null, positions: {}, details: {} });

const isId = (value: unknown): value is LiturgyId => LITURGY_IDS.includes(value as LiturgyId);

function cleanIndex(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.round(Math.min(Math.max(n, 0), MAX_BLOCK_INDEX));
}

/** One line of at most `max` characters: control characters dropped, spaces collapsed. */
export function makeSnippet(value: unknown, max: number = SNIPPET_LENGTH): string {
  if (typeof value !== 'string') return '';
  let spaced = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    const control = code < 0x20 || (code >= 0x7f && code <= 0x9f) || code === 0x2028 || code === 0x2029;
    spaced += control ? ' ' : ch;
  }
  const flat = spaced.replace(/\s+/g, ' ').trim();
  const chars = Array.from(flat);
  if (chars.length <= max) return flat;
  return chars.slice(0, Math.max(0, max - 1)).join('').trimEnd() + '…';
}

function capRecord<T>(record: Partial<Record<LiturgyId, T>>) {
  const ids = Object.keys(record) as LiturgyId[];
  for (const drop of ids.slice(0, Math.max(0, ids.length - MAX_REMEMBERED))) {
    delete record[drop];
  }
}

function cleanDetail(value: unknown): ServiceDetail | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const { furthest, length, snippet, bookmark } = value as Record<string, unknown>;
  const len = cleanIndex(length);
  let far = cleanIndex(furthest);
  if (len > 0) far = Math.min(far, len - 1);
  let mark: ServiceDetail['bookmark'] = null;
  if (bookmark && typeof bookmark === 'object' && !Array.isArray(bookmark)) {
    const b = bookmark as Record<string, unknown>;
    if (typeof b.index === 'number' && Number.isFinite(b.index)) {
      mark = { index: cleanIndex(b.index), snippet: makeSnippet(b.snippet) };
    }
  }
  return { furthest: far, length: len, snippet: makeSnippet(snippet), bookmark: mark };
}

/** A well-formed progress record; unknown ids and junk are dropped. Never throws. */
export function cleanProgress(value: unknown): LiturgyProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyProgress();
  const { last, positions, details } = value as Record<string, unknown>;
  const out = emptyProgress();
  if (last && typeof last === 'object' && !Array.isArray(last)) {
    const { id, index } = last as Record<string, unknown>;
    if (isId(id)) out.last = { id, index: cleanIndex(index) };
  }
  if (positions && typeof positions === 'object' && !Array.isArray(positions)) {
    for (const [id, index] of Object.entries(positions).slice(0, MAX_REMEMBERED * 4)) {
      if (isId(id)) out.positions[id] = cleanIndex(index);
    }
    capRecord(out.positions);
  }
  // Records saved before details existed have none; that is fine.
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    for (const [id, detail] of Object.entries(details).slice(0, MAX_REMEMBERED * 4)) {
      if (!isId(id)) continue;
      const clean = cleanDetail(detail);
      if (clean) out.details[id] = clean;
    }
    capRecord(out.details);
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

/** What the reader reports when saving a position. All parts are optional. */
export interface RecordInfo {
  /** Last block on screen; the furthest block never moves back. Defaults to `index`. */
  reached?: number;
  /** Number of blocks in the text. */
  length?: number;
  /** Start of the text at `index`. */
  snippet?: string;
}

const blankDetail = (): ServiceDetail => ({ furthest: 0, length: 0, snippet: '', bookmark: null });

/** `progress.details` with `detail` stored as the most recently read one. */
function withDetail(progress: LiturgyProgress, id: LiturgyId, detail: ServiceDetail) {
  const details = { ...progress.details };
  delete details[id]; // re-insert at the "most recent" end
  details[id] = detail;
  capRecord(details);
  return details;
}

/** Records that `index` is the first block on screen in service `id`; returns a new record. */
export function recordPosition(
  progress: LiturgyProgress,
  id: LiturgyId,
  index: number,
  info?: RecordInfo,
): LiturgyProgress {
  const clean = cleanIndex(index);
  const positions = { ...progress.positions };
  // Delete first so the entry moves to the "most recent" end.
  delete positions[id];
  positions[id] = clean;
  capRecord(positions);
  const prev = progress.details[id];
  let details = progress.details;
  if (info || prev) {
    const length =
      info?.length !== undefined && info.length > 0 ? cleanIndex(info.length) : (prev?.length ?? 0);
    let furthest = Math.max(prev?.furthest ?? 0, cleanIndex(info?.reached ?? clean), clean);
    if (length > 0) furthest = Math.min(furthest, length - 1);
    details = withDetail(progress, id, {
      furthest,
      length,
      snippet: info?.snippet !== undefined ? makeSnippet(info.snippet) : (prev?.snippet ?? ''),
      bookmark: prev?.bookmark ?? null,
    });
  }
  return { last: { id, index: clean }, positions, details };
}

/** Sets the one bookmark of service `id` at block `index`. */
export function setBookmark(
  progress: LiturgyProgress,
  id: LiturgyId,
  index: number,
  snippet: string,
): LiturgyProgress {
  const detail = { ...(progress.details[id] ?? blankDetail()) };
  detail.bookmark = { index: cleanIndex(index), snippet: makeSnippet(snippet) };
  return { ...progress, details: withDetail(progress, id, detail) };
}

/** Removes the bookmark of service `id`. */
export function clearBookmark(progress: LiturgyProgress, id: LiturgyId): LiturgyProgress {
  const prev = progress.details[id];
  if (!prev?.bookmark) return progress;
  return { ...progress, details: withDetail(progress, id, { ...prev, bookmark: null }) };
}

/** Sets the bookmark at `index`, or removes it when it is already there. */
export function toggleBookmark(
  progress: LiturgyProgress,
  id: LiturgyId,
  index: number,
  snippet: string,
): LiturgyProgress {
  return progress.details[id]?.bookmark?.index === cleanIndex(index)
    ? clearBookmark(progress, id)
    : setBookmark(progress, id, index, snippet);
}

/** Forgets everything about service `id`: place, furthest block and bookmark. */
export function resetService(progress: LiturgyProgress, id: LiturgyId): LiturgyProgress {
  const positions = { ...progress.positions };
  const details = { ...progress.details };
  delete positions[id];
  delete details[id];
  return { last: progress.last?.id === id ? null : progress.last, positions, details };
}

/** Whole percent of the text that has been on screen (0-100); null when the length is unknown. */
export function percentRead(detail: ServiceDetail | undefined): number | null {
  if (!detail || detail.length <= 0) return null;
  const pct = Math.round(((detail.furthest + 1) / detail.length) * 100);
  return Math.min(100, Math.max(0, pct));
}

/** True when the list marks the service: read beyond the first block, or bookmarked. */
export function hasProgress(detail: ServiceDetail | undefined): boolean {
  return !!detail && (detail.furthest > 0 || detail.bookmark !== null);
}

/** Block to scroll to when opening `id`, kept inside a text of `length` blocks (0 = start). */
export function restoreIndex(progress: LiturgyProgress, id: LiturgyId, length: number): number {
  const index = progress.positions[id] ?? 0;
  if (length <= 0) return 0;
  return Math.min(index, length - 1);
}

/** Bookmark block to scroll to, kept inside a text of `length` blocks; null when there is none. */
export function bookmarkIndex(progress: LiturgyProgress, id: LiturgyId, length: number): number | null {
  const mark = progress.details[id]?.bookmark;
  if (!mark || length <= 0) return null;
  return Math.min(mark.index, length - 1);
}
