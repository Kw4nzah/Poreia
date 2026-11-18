// The one-glance answer for a day: what the fast is, what is allowed and what to avoid.
// Pure and built only from the calendar engine and the food helpers, so the Today card and
// the daily notification say the same thing and the rules live in one place.

import { DayInfo, FOOD_IDS, isFoodAllowed } from '../calendar';
import { readingReference, type BookLanguage, type Commemoration } from '../commemorations';
import { getFoodStatus } from '../foods/lookup';
import type { Messages } from '../i18n';

export interface DaySummary {
  /** "Feast: Annunciation." when the day carries a feast, otherwise null. */
  feast: string | null;
  /** "Today: No meat." or "No fast today." */
  fast: string;
  /** "Allowed: fish, oil, wine." Null when the day has no fast. */
  allowed: string | null;
  /** "Avoid: meat, dairy, eggs." Null when the day has no fast. */
  avoided: string | null;
  /** Fish in the Greek fasts where published practice differs. */
  disputed: string | null;
  /** The feast and the fast, as one line. */
  headline: string;
  /** Allowed, avoided and disputed, as one line. Empty when the day has no fast. */
  foods: string;
}

export function summarizeDay(info: DayInfo, m: Messages): DaySummary {
  const s = m.summary;
  const feast =
    info.feasts.length > 0 ? s.feast(info.feasts.map((id) => m.feast[id]).join(' · ')) : null;

  if (info.level === 'none') {
    const headline = feast ? `${feast} ${s.noFast}` : s.noFast;
    return {
      feast,
      fast: s.noFast,
      allowed: null,
      avoided: null,
      disputed: null,
      headline,
      foods: '',
    };
  }

  // `oil` stands for wine and oil together; on a wine-only day wine moves to the allowed side.
  const wineAllowed = getFoodStatus('wine', info.level, info.notes) === 'allowed';
  const allowed: string[] = [];
  const avoided: string[] = [];
  for (const food of FOOD_IDS) {
    if (isFoodAllowed(info.level, food)) allowed.push(s.food[food]);
    else if (food === 'oil' && wineAllowed) {
      allowed.push(s.wine);
      avoided.push(s.oil);
    } else avoided.push(s.food[food]);
  }
  if (info.level === 'noOil' || info.level === 'xerophagy') allowed.push(s.plain[info.level]);

  const fast = s.today(m.level[info.level].title);
  const disputed =
    getFoodStatus('fish', info.level, info.notes) === 'disputed' ? s.fishDisputed : null;
  const allowedLine = allowed.length > 0 ? s.allowed(allowed.join(', ')) : null;
  const avoidedLine = avoided.length > 0 ? s.avoided(avoided.join(', ')) : null;
  const foods = [allowedLine, avoidedLine, disputed].filter((x): x is string => x !== null);
  return {
    feast,
    fast,
    allowed: allowedLine,
    avoided: avoidedLine,
    disputed,
    headline: feast ? `${feast} ${fast}` : fast,
    foods: foods.join(' '),
  };
}

/** "Epistle: Eph 1:1-4 · Gospel: Luke 3:4", or null when the day has neither reading. */
export function readingsLine(
  commemoration: Commemoration | null,
  m: Messages,
  language: BookLanguage,
): string | null {
  const parts: string[] = [];
  for (const kind of ['epistle', 'gospel'] as const) {
    const reading = commemoration?.readings.find((r) => r.kind === kind);
    const reference = reading ? readingReference(reading, language) : '';
    if (reference) parts.push(`${m.readings[kind]}: ${reference}`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}
