// Turns raw download byte counts into what the progress popup shows. Pure, so it is tested
// without a device.

export interface ProgressView {
  /** Bytes received so far, never negative and never above a known total. */
  written: number;
  /** Total size in bytes, or null when neither the server nor the release listing gave one. */
  total: number | null;
  /** 0..1, or null when the total is unknown (the bar then shows no fill). */
  fraction: number | null;
  /** Whole percent 0..100, or null when the total is unknown. 100 only when complete. */
  percent: number | null;
}

function validSize(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/**
 * `reportedTotal` is what the download itself says (-1 when the server sent no Content-Length);
 * `expectedTotal` is the fallback, such as the asset size from the release listing.
 */
export function computeProgress(
  written: number,
  reportedTotal?: number | null,
  expectedTotal?: number | null,
): ProgressView {
  const safeWritten = Number.isFinite(written) && written > 0 ? written : 0;
  const total = validSize(reportedTotal)
    ? reportedTotal
    : validSize(expectedTotal)
      ? expectedTotal
      : null;
  if (total === null) return { written: safeWritten, total: null, fraction: null, percent: null };
  const clamped = Math.min(safeWritten, total);
  const fraction = clamped / total;
  return { written: clamped, total, fraction, percent: Math.floor(fraction * 100) };
}

/** Megabytes with one decimal ("12.3"); Turkish and Russian write a decimal comma. */
export function formatMegabytes(bytes: number, language: string): string {
  const safe = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
  const text = (safe / 1_000_000).toFixed(1);
  return language === 'en' ? text : text.replace('.', ',');
}
