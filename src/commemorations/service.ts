// The English service names that orthocal.info gives readings ("3rd Matins Gospel", "6th Hour,
// Prophecy", ...) split into parts so the screens can name them in the user's language.

export type ServiceKind = 'vespers' | 'matins' | 'hour' | 'passion' | 'waters' | 'cross';
export type ServicePart = 'gospel' | 'epistle' | 'prophecy';

export interface ParsedService {
  kind: ServiceKind;
  /** Ordinal of a Matins Gospel, an Hour or a Passion Gospel. */
  n?: number;
  part?: ServicePart;
}

const PATTERN = /^(?:(\d+)(?:st|nd|rd|th) )?(Vespers|Matins|Hour|Passion)(?: (Gospel|Epistle))?(?:, (Prophecy|Epistle|Gospel))?$/;

/** Structure of a service name, or null for one that is not recognised (shown as given). */
export function parseService(source: string): ParsedService | null {
  if (source === 'Great Blessing of Waters') return { kind: 'waters' };
  if (source === 'Cross Procession') return { kind: 'cross' };
  const match = PATTERN.exec(source);
  if (!match) return null;
  const [, n, name, tail, after] = match;
  const kind = name.toLowerCase() as ServiceKind;
  const part = (after ?? tail)?.toLowerCase() as ServicePart | undefined;
  return { kind, ...(n ? { n: Number(n) } : {}), ...(part ? { part } : {}) };
}
