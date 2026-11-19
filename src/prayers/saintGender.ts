// Grammatical gender of a saint the user names, and what it changes in the prayers.
// Pure: no UI and no i18n imports besides the language type.

import type { Language } from '../i18n';

export type SaintGender = 'm' | 'f';

export const SAINT_GENDERS: readonly SaintGender[] = ['m', 'f'];

/** What saints saved before gender existed are treated as. */
export const DEFAULT_SAINT_GENDER: SaintGender = 'm';

export function isSaintGender(value: unknown): value is SaintGender {
  return value === 'm' || value === 'f';
}

// ---------------------------------------------------------------- guessing

function normalise(word: string): string {
  return word
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ё/g, 'е')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function set(names: string): Set<string> {
  return new Set(names.split(/\s+/).filter(Boolean).map(normalise));
}

// Conservative on purpose: only names that are certain. Anything else is left to the user.
const FEMALE = set(`
  maria mary meryem marie мария мариам
  anna ana anne анна
  catherine katherine ekaterina aikaterini katerina екатерина
  tatiana tatyana татиана татьяна
  xenia ksenia kseniya ksenya ксения
  irene irina eirini irini ирина ирини
  barbara varvara варвара
  paraskevi paraskeva parasceva параскева
  anastasia anastasiya анастасия
  elizabeth elisabeth elisaveta elisavet елизавета
  helen helena elena eleni елена
  sophia sofia sofya софия
  nina нина
  olga ольга
  lydia lidia лидия
  photini fotini svetlana фотиния светлана
  marina марина
  matrona матрона
  zoe зоя
  theodora феодора
  eugenia evgenia евгения
  euphrosyne evfrosinia ефросиния евфросиния
  juliana iuliana юлиана
  magdalene magdalena
  thekla thecla фекла текла
  natalia natalya наталия наталья
  vera вера
  nadezhda надежда
  lyubov любовь
  agatha agathi агата
  agnes агния
  cecilia цецилия
  christina kristina христина
  glykeria гликерия
  macrina макрина
  monica monika моника
  pelagia пелагия
  salome саломея
  susanna сусанна
  tamara тамара
  veronica вероника
  valentina валентина
  alexandra александра
  victoria виктория
  claudia клавдия
`);

// Names that look feminine in some languages but belong to male saints.
const MALE = set(`
  nikita никита
  ilya ilia ilja илья
  luka luke лука
  savva sava савва
  foma фома
  kosma kosmas кузьма
  andrea
`);

const MALE_TITLES = set('st saint saints sv aziz agios святой св');
const FEMALE_TITLES = set('azize agia святая');

/**
 * Guesses the gender from the first word of the typed name; null when not sure. Never guesses
 * from word endings. Ignores case, diacritics and a leading title ("St", "Aziz", "Святая").
 */
export function guessSaintGender(name: string): SaintGender | null {
  const words = name
    .split(/\s+/)
    .map((w) => normalise(w.replace(/[.,;:]+$/u, '')))
    .filter(Boolean);
  let first = words[0];
  if (first === undefined) return null;
  if (FEMALE_TITLES.has(first)) return 'f';
  if (MALE_TITLES.has(first)) {
    first = words[1];
    if (first === undefined) return null;
  }
  if (MALE.has(first)) return 'm';
  return FEMALE.has(first) ? 'f' : null;
}

// ---------------------------------------------------------------- prayer text

/** Masculine form first, feminine second; matched exactly (case-sensitive), `{name}` untouched. */
export const GENDER_VARIANTS: Partial<Record<Language, readonly (readonly [string, string])[]>> = {
  tr: [['huzurunda duran aziz!', 'huzurunda duran azize!']],
  ru: [
    ['О святой {name}', 'О святая {name}'],
    ['Святой {name}', 'Святая {name}'],
    ['верный служитель Христов', 'верная служительница Христова'],
    ['предстоящий перед Богом', 'предстоящая перед Богом'],
  ],
};

/** The prayer text with its gendered words in the saint's gender. Male text is returned as is. */
export function applyGender(text: string, gender: SaintGender, language: Language): string {
  if (gender === 'm') return text;
  let out = text;
  for (const [male, female] of GENDER_VARIANTS[language] ?? []) out = out.split(male).join(female);
  return out;
}
