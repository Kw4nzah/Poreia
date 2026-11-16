// Fasting calendar engine. Output is language-neutral (ids only); the UI layer
// translates ids to text.
//
// Sources (checked 2026-11-16):
// - Slavic practice: compared day by day against the OCA calendar API (orthocal.info)
//   for all of 2026. The remaining differences are single-saint dispensations (and OCA's
//   own saints) that are not modelled.
// - Greek practice: Vima Orthodoxias "Πότε και πώς νηστεύομε" (all periods), the Church of
//   Greece news agency (orthodoxianewsagency.gr) and the Oropos and Phyli guidelines
//   (imoph.org) for the Nativity Fast, where they disagree on fish (see nativityFastRule).
// Rules are general guidance: local custom and a spiritual father's advice override.
// Saint-day dispensations are only partly included.

import { Church, FastingPractice } from './churches';
import {
  CivilDate,
  Weekday,
  gregorianToJdn,
  jdnToGregorian,
  jdnToJulian,
  julianToJdn,
  paschaJdn,
  weekdayOfJdn,
} from './dates';

/** From least to most restrictive. */
export type FastLevel =
  | 'none' // no fasting
  | 'noMeat' // dairy, eggs and fish allowed (Cheesefare)
  | 'fish' // fish, wine and oil allowed
  | 'oil' // wine and oil allowed, no fish
  | 'noOil' // cooked food without oil
  | 'xerophagy'; // dry eating: bread, fruit, vegetables, nuts

export type PeriodId =
  | 'publicanWeek'
  | 'cheesefareWeek'
  | 'greatLent'
  | 'holyWeek'
  | 'brightWeek'
  | 'trinityWeek'
  | 'apostlesFast'
  | 'dormitionFast'
  | 'nativityFast'
  | 'christmastide';

export type MajorFastId = 'greatLent' | 'apostlesFast' | 'dormitionFast' | 'nativityFast';

export type FastDayId =
  | 'wednesday'
  | 'friday'
  | 'theophanyEve'
  | 'beheadingOfJohn'
  | 'exaltationOfCross';

export type FeastId =
  | 'pascha'
  | 'palmSunday'
  | 'lazarusSaturday'
  | 'ascension'
  | 'pentecost'
  | 'nativityOfTheotokos'
  | 'exaltationOfCross'
  | 'protectionOfTheotokos'
  | 'entryOfTheotokos'
  | 'nativityOfChrist'
  | 'circumcision'
  | 'theophany'
  | 'meetingOfTheLord'
  | 'annunciation'
  | 'nativityOfForerunner'
  | 'peterAndPaul'
  | 'transfiguration'
  | 'dormition'
  | 'beheadingOfJohn';

/**
 * Which published Greek rule decides fish in the Nativity and Apostles' Fasts (Greek
 * practice only). `unsure` shows the stricter reading and flags the disputed days.
 */
export const GREEK_FISH_PRACTICES = ['unsure', 'weekends', 'studite', 'greece'] as const;
export type GreekFishPractice = (typeof GREEK_FISH_PRACTICES)[number];
export const DEFAULT_GREEK_FISH_PRACTICE: GreekFishPractice = 'unsure';

export interface DayOptions {
  greekFish?: GreekFishPractice;
}

export type NoteId =
  | 'totalAbstinence'
  | 'caviarAllowed'
  | 'feastRelaxation'
  /** Published Greek practice disagrees on fish; the level shows the stricter reading. */
  | 'fishDisputed'
  /** Wine, but not oil, is allowed. */
  | 'wineOnly';

export interface PeriodRange {
  id: PeriodId;
  startJdn: number;
  endJdn: number; // inclusive
}

export interface DayPeriod {
  id: PeriodId;
  /** 1-based day within the period */
  day: number;
  totalDays: number;
  daysLeft: number;
  start: CivilDate;
  end: CivilDate;
}

export interface DayInfo {
  /** Civil (Gregorian) date */
  date: CivilDate;
  /** Same day on the church's fixed-feast calendar */
  churchDate: CivilDate;
  weekday: Weekday;
  level: FastLevel;
  period: DayPeriod | null;
  /** Set when the fast comes from a single fast day rather than a period */
  fastDay: FastDayId | null;
  feasts: FeastId[];
  notes: NoteId[];
  /** Days until the next Pascha (0 on Pascha itself) */
  daysToPascha: number;
}

export interface UpcomingFast {
  id: MajorFastId;
  start: CivilDate;
  end: CivilDate;
  daysUntil: number;
}

const SUN = 0, MON = 1, TUE = 2, WED = 3, THU = 4, FRI = 5, SAT = 6;

const FIXED_FEASTS: Record<string, FeastId> = {
  '9-8': 'nativityOfTheotokos',
  '9-14': 'exaltationOfCross',
  '10-1': 'protectionOfTheotokos',
  '11-21': 'entryOfTheotokos',
  '12-25': 'nativityOfChrist',
  '1-1': 'circumcision',
  '1-6': 'theophany',
  '2-2': 'meetingOfTheLord',
  '3-25': 'annunciation',
  '6-24': 'nativityOfForerunner',
  '6-29': 'peterAndPaul',
  '8-6': 'transfiguration',
  '8-15': 'dormition',
  '8-29': 'beheadingOfJohn',
};

const MOVABLE_FEASTS: Record<number, FeastId> = {
  [-8]: 'lazarusSaturday',
  [-7]: 'palmSunday',
  0: 'pascha',
  39: 'ascension',
  49: 'pentecost',
};

/** Feasts that allow fish when they land on a fast day outside Great Lent. */
const FISH_FEASTS = new Set<FeastId>([
  'nativityOfTheotokos',
  'entryOfTheotokos',
  'meetingOfTheLord',
  'nativityOfForerunner',
  'peterAndPaul',
  'transfiguration',
  'dormition',
]);

function fixedToJdn(church: Church, year: number, month: number, day: number): number {
  return church.fixedCalendar === 'julian'
    ? julianToJdn(year, month, day)
    : gregorianToJdn(year, month, day);
}

function jdnToFixed(church: Church, jdn: number): CivilDate {
  return church.fixedCalendar === 'julian' ? jdnToJulian(jdn) : jdnToGregorian(jdn);
}

/**
 * All periods anchored in one year: Pascha of civil year `year` and fixed
 * dates of church-calendar year `year`.
 */
export function getPeriods(year: number, church: Church): PeriodRange[] {
  const p = paschaJdn(year);
  const fixed = (m: number, d: number, y = year) => fixedToJdn(church, y, m, d);
  const periods: PeriodRange[] = [
    { id: 'publicanWeek', startJdn: p - 69, endJdn: p - 63 },
    { id: 'cheesefareWeek', startJdn: p - 55, endJdn: p - 49 },
    // Includes Lazarus Saturday and Palm Sunday, which close the forty days.
    { id: 'greatLent', startJdn: p - 48, endJdn: p - 7 },
    { id: 'holyWeek', startJdn: p - 6, endJdn: p - 1 },
    { id: 'brightWeek', startJdn: p, endJdn: p + 6 },
    { id: 'trinityWeek', startJdn: p + 50, endJdn: p + 56 },
    { id: 'dormitionFast', startJdn: fixed(8, 1), endJdn: fixed(8, 14) },
    { id: 'nativityFast', startJdn: fixed(11, 15), endJdn: fixed(12, 24) },
    { id: 'christmastide', startJdn: fixed(12, 25), endJdn: fixed(1, 4, year + 1) },
  ];
  // On the new calendar a late Pascha can leave no room for this fast at all.
  const apostlesStart = p + 57;
  const apostlesEnd = fixed(6, 28);
  if (apostlesStart <= apostlesEnd) {
    periods.push({ id: 'apostlesFast', startJdn: apostlesStart, endJdn: apostlesEnd });
  }
  return periods;
}

function findPeriod(jdn: number, civilYear: number, church: Church): PeriodRange | null {
  for (const year of [civilYear, civilYear - 1]) {
    const hit = getPeriods(year, church).find((r) => jdn >= r.startJdn && jdn <= r.endJdn);
    if (hit) return hit;
  }
  return null;
}

interface RuleContext {
  practice: FastingPractice;
  greekFish: GreekFishPractice;
  weekday: Weekday;
  /** Days from Pascha of the civil year */
  offset: number;
  month: number; // on the church's fixed calendar
  day: number;
  feasts: FeastId[];
}

interface Rule {
  level: FastLevel;
  notes?: NoteId[];
}

const isWeekend = (wd: Weekday) => wd === SAT || wd === SUN;
const isWedFri = (wd: Weekday) => wd === WED || wd === FRI;
const hasFishFeast = (c: RuleContext) =>
  c.feasts.some((f) => FISH_FEASTS.has(f)) ||
  (c.practice === 'slavic' && c.feasts.includes('protectionOfTheotokos'));

/** Slavic weekday pattern: Mon/Wed/Fri dry, Tue/Thu without oil, weekend with oil. */
function slavicStrictWeek(wd: Weekday): FastLevel {
  if (isWeekend(wd)) return 'oil';
  return wd === TUE || wd === THU ? 'noOil' : 'xerophagy';
}

function greatLentRule(c: RuleContext): Rule {
  if (c.feasts.includes('annunciation') || c.feasts.includes('palmSunday')) {
    return { level: 'fish', notes: ['feastRelaxation'] };
  }
  if (c.feasts.includes('lazarusSaturday')) {
    return { level: 'oil', notes: c.practice === 'slavic' ? ['caviarAllowed'] : [] };
  }
  if (isWeekend(c.weekday)) return { level: 'oil' };
  // Finding of the Head of the Forerunner (Feb 24) and the Forty Martyrs (Mar 9).
  if ((c.month === 2 && c.day === 24) || (c.month === 3 && c.day === 9)) {
    return { level: 'oil', notes: ['feastRelaxation'] };
  }
  return { level: c.practice === 'slavic' ? slavicStrictWeek(c.weekday) : 'noOil' };
}

function holyWeekRule(c: RuleContext): Rule {
  const strict: FastLevel = c.practice === 'slavic' ? 'xerophagy' : 'noOil';
  if (c.weekday === FRI) return { level: 'xerophagy', notes: ['totalAbstinence'] };
  if (c.weekday === THU) {
    return { level: 'oil', notes: c.feasts.includes('annunciation') ? ['feastRelaxation'] : [] };
  }
  // On Monday to Wednesday and on Great Saturday only wine is allowed, for the Annunciation
  // or, on Saturday, for the day itself (not oil, not fish).
  if (c.weekday === SAT || c.feasts.includes('annunciation')) {
    return { level: strict, notes: ['wineOnly'] };
  }
  return { level: strict };
}

function apostlesFastRule(c: RuleContext): Rule {
  if (hasFishFeast(c)) return { level: 'fish', notes: ['feastRelaxation'] };
  // Typikon ch. 33: fish on Saturday and Sunday only; Tuesday and Thursday wine and oil.
  if (c.practice === 'slavic') {
    if (c.weekday === MON) return { level: 'noOil' };
    if (isWedFri(c.weekday)) return { level: 'xerophagy' };
    return { level: isWeekend(c.weekday) ? 'fish' : 'oil' };
  }
  // Greek sources agree on fish for Tuesday, Thursday and weekends; Church of Greece
  // calendars also give it on Monday, the Typikon-based ones do not.
  if (isWedFri(c.weekday)) return { level: 'noOil' };
  return greekFishRule(c, (p) => {
    if (p === 'greece') return true;
    if (p === 'studite') return c.weekday !== MON;
    return isWeekend(c.weekday);
  }, 'studite');
}

function dormitionFastRule(c: RuleContext): Rule {
  if (hasFishFeast(c)) return { level: 'fish', notes: ['feastRelaxation'] };
  if (c.practice === 'slavic') return { level: slavicStrictWeek(c.weekday) };
  return { level: isWeekend(c.weekday) ? 'oil' : 'noOil' };
}

/**
 * Saints whose feast gives wine and oil on a Wednesday or Friday of the Nativity Fast
 * (Greek practice), as "month-day". Matthew, Catherine, Andrew, Barbara, Sabbas,
 * Nicholas, Anna, Spyridon, Eleutherios, Daniel and the Three Youths, Ignatios.
 */
const GREEK_NATIVITY_OIL_DAYS = new Set([
  '11-16',
  '11-25',
  '11-30',
  '12-4',
  '12-5',
  '12-6',
  '12-9',
  '12-12',
  '12-15',
  '12-17',
  '12-20',
]);

/**
 * Fish on a Greek-practice Mon/Tue/Thu/Sat/Sun of a fast, decided by the chosen rule.
 * `allows(p)` says whether rule `p` gives fish today; with `unsure` the stricter rule
 * `strictest` is shown and the day is flagged when the Church of Greece rule differs.
 */
function greekFishRule(
  c: RuleContext,
  allows: (p: GreekFishPractice) => boolean,
  strictest: GreekFishPractice,
): Rule {
  if (c.greekFish !== 'unsure') return { level: allows(c.greekFish) ? 'fish' : 'oil' };
  const strict = allows(strictest);
  const disputed = strict !== allows('greece');
  return { level: strict ? 'fish' : 'oil', notes: disputed ? ['fishDisputed'] : [] };
}

function nativityFastRule(c: RuleContext): Rule {
  const december = c.month === 12;
  if (december && c.day === 24) return eveRule(c);
  if (hasFishFeast(c)) return { level: 'fish', notes: ['feastRelaxation'] };

  if (c.practice === 'slavic') {
    // St Nicholas (Dec 6) closes the first, mildest stretch.
    if (december && c.day === 6) return { level: 'fish', notes: ['feastRelaxation'] };
    if (!december || c.day < 6) {
      if (c.weekday === MON) return { level: 'noOil' };
      if (isWedFri(c.weekday)) return { level: 'xerophagy' };
      return { level: isWeekend(c.weekday) ? 'fish' : 'oil' };
    }
    if (c.day <= 19) {
      if (isWeekend(c.weekday)) return { level: 'fish' };
      if (c.weekday === MON) return { level: 'noOil' };
      return { level: isWedFri(c.weekday) ? 'xerophagy' : 'oil' };
    }
    return { level: slavicStrictWeek(c.weekday) };
  }

  // Greek practice. Published rules differ on which weekdays allow fish until 17 Dec:
  //   Church of Greece news agency, GOARCH, Thyateira: every day except Wed/Fri;
  //   Studite typikon (Oropos and Phyli): Tue/Thu/Sat/Sun from 22 Nov;
  //   Vima Orthodoxias: Sat/Sun only; strict local custom: Sat/Sun until 12 Dec.
  // Fish is shown as allowed only where the first three agree (Sat/Sun from 22 Nov to
  // 17 Dec, and 21 Nov, handled as a fish feast). On days where they disagree the level
  // is the stricter one and the day carries the `fishDisputed` note.
  if (isWedFri(c.weekday)) {
    return GREEK_NATIVITY_OIL_DAYS.has(`${c.month}-${c.day}`)
      ? { level: 'oil', notes: ['feastRelaxation'] }
      : { level: 'noOil' };
  }
  const fishPeriod = c.month === 11 || (december && c.day <= 17);
  if (!fishPeriod) return { level: 'oil' }; // 18-23 Dec: wine and oil, no fish anywhere
  const firstWeek = c.month === 11 && c.day < 22;
  return greekFishRule(c, (p) => {
    if (p === 'greece') return true; // every day except Wed/Fri
    if (firstWeek) return false; // weekdays and the first Sunday
    if (p === 'studite') return c.weekday !== MON;
    return isWeekend(c.weekday); // 'weekends' and the strict reference
  }, 'weekends');
}

/** Strict single fast days: the eves of Nativity and Theophany, the Beheading, the Exaltation. */
function eveRule(c: RuleContext): Rule {
  if (isWeekend(c.weekday)) return { level: 'oil' };
  return { level: c.practice === 'slavic' ? 'xerophagy' : 'noOil' };
}

function ordinaryWedFriRule(c: RuleContext): Rule {
  if (hasFishFeast(c)) return { level: 'fish', notes: ['feastRelaxation'] };
  const paschalSeason = c.offset >= 7 && c.offset <= 49;
  if (paschalSeason) {
    // Mid-Pentecost and the Leavetaking of Pascha, both Wednesdays.
    return { level: c.offset === 24 || c.offset === 38 ? 'fish' : 'oil' };
  }
  return { level: c.practice === 'slavic' ? 'xerophagy' : 'noOil' };
}

function toDayPeriod(range: PeriodRange, jdn: number): DayPeriod {
  return {
    id: range.id,
    day: jdn - range.startJdn + 1,
    totalDays: range.endJdn - range.startJdn + 1,
    daysLeft: range.endJdn - jdn,
    start: jdnToGregorian(range.startJdn),
    end: jdnToGregorian(range.endJdn),
  };
}

export function getDayInfo(date: CivilDate, church: Church, options: DayOptions = {}): DayInfo {
  const jdn = gregorianToJdn(date.year, date.month, date.day);
  const weekday = weekdayOfJdn(jdn);
  const churchDate = jdnToFixed(church, jdn);
  const pascha = paschaJdn(date.year);
  const offset = jdn - pascha;

  const feasts: FeastId[] = [];
  const movable = MOVABLE_FEASTS[offset];
  if (movable) feasts.push(movable);
  const fixedFeast = FIXED_FEASTS[`${churchDate.month}-${churchDate.day}`];
  if (fixedFeast) feasts.push(fixedFeast);

  const ctx: RuleContext = {
    practice: church.practice,
    greekFish: options.greekFish ?? DEFAULT_GREEK_FISH_PRACTICE,
    weekday,
    offset,
    month: churchDate.month,
    day: churchDate.day,
    feasts,
  };

  const range = findPeriod(jdn, date.year, church);
  let rule: Rule;
  let fastDay: FastDayId | null = null;

  switch (range?.id) {
    case 'publicanWeek':
    case 'brightWeek':
    case 'trinityWeek':
    case 'christmastide':
      rule = { level: 'none' };
      break;
    case 'cheesefareWeek':
      rule = { level: 'noMeat' };
      break;
    case 'greatLent':
      rule = greatLentRule(ctx);
      break;
    case 'holyWeek':
      rule = holyWeekRule(ctx);
      break;
    case 'apostlesFast':
      rule = apostlesFastRule(ctx);
      break;
    case 'dormitionFast':
      rule = dormitionFastRule(ctx);
      break;
    case 'nativityFast':
      rule = nativityFastRule(ctx);
      break;
    default:
      if (feasts.includes('theophany')) {
        rule = { level: 'none' };
      } else if (ctx.month === 1 && ctx.day === 5) {
        fastDay = 'theophanyEve';
        rule = eveRule(ctx);
      } else if (feasts.includes('beheadingOfJohn')) {
        fastDay = 'beheadingOfJohn';
        rule = eveRule(ctx);
      } else if (feasts.includes('exaltationOfCross')) {
        fastDay = 'exaltationOfCross';
        rule = eveRule(ctx);
      } else if (isWedFri(weekday)) {
        fastDay = weekday === WED ? 'wednesday' : 'friday';
        rule = ordinaryWedFriRule(ctx);
      } else {
        rule = { level: 'none' };
      }
  }

  const nextPascha = offset <= 0 ? pascha : paschaJdn(date.year + 1);

  return {
    date,
    churchDate,
    weekday,
    level: rule.level,
    period: range ? toDayPeriod(range, jdn) : null,
    fastDay,
    feasts,
    notes: rule.notes ?? [],
    daysToPascha: nextPascha - jdn,
  };
}

/** The next of the four major fasts that starts after `date`. */
export function getUpcomingFast(date: CivilDate, church: Church): UpcomingFast {
  const jdn = gregorianToJdn(date.year, date.month, date.day);
  const major: PeriodId[] = ['greatLent', 'apostlesFast', 'dormitionFast', 'nativityFast'];
  const next = [date.year - 1, date.year, date.year + 1]
    .flatMap((y) => getPeriods(y, church))
    .filter((r) => major.includes(r.id) && r.startJdn > jdn)
    .sort((a, b) => a.startJdn - b.startJdn)[0];
  // Holy Week continues Great Lent, so report the whole stretch up to Pascha.
  const endJdn = next.id === 'greatLent' ? next.endJdn + 6 : next.endJdn;
  return {
    id: next.id as MajorFastId,
    start: jdnToGregorian(next.startJdn),
    end: jdnToGregorian(endJdn),
    daysUntil: next.startJdn - jdn,
  };
}
