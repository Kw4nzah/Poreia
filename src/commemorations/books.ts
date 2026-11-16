// Names of the scripture books used by the lectionary data (USFM codes from orthocal.info).
// ru follows the Synodal translation (1-4 Kingdoms, "От Матфея"); tr uses the usual Turkish
// book names and has NOT been reviewed by the user yet.

export type BookLanguage = 'en' | 'tr' | 'ru';

type Names = readonly [en: string, tr: string, ru: string];

const BOOKS: Record<string, Names> = {
  '1CO': ['1 Corinthians', '1. Korintliler', '1-е Коринфянам'],
  '2CO': ['2 Corinthians', '2. Korintliler', '2-е Коринфянам'],
  '1JN': ['1 John', '1. Yuhanna', '1-е Иоанна'],
  '2JN': ['2 John', '2. Yuhanna', '2-е Иоанна'],
  '3JN': ['3 John', '3. Yuhanna', '3-е Иоанна'],
  '1PE': ['1 Peter', '1. Petrus', '1-е Петра'],
  '2PE': ['2 Peter', '2. Petrus', '2-е Петра'],
  '1TH': ['1 Thessalonians', '1. Selanikliler', '1-е Фессалоникийцам'],
  '2TH': ['2 Thessalonians', '2. Selanikliler', '2-е Фессалоникийцам'],
  '1TI': ['1 Timothy', '1. Timoteos', '1-е Тимофею'],
  '2TI': ['2 Timothy', '2. Timoteos', '2-е Тимофею'],
  '1KI': ['1 Kings', '1. Krallar', '3-я Царств'],
  '2KI': ['2 Kings', '2. Krallar', '4-я Царств'],
  ACT: ['Acts', 'Elçilerin İşleri', 'Деяния'],
  AMO: ['Amos', 'Amos', 'Амос'],
  BAR: ['Baruch', 'Baruk', 'Варух'],
  COL: ['Colossians', 'Koloseliler', 'Колоссянам'],
  DAN: ['Daniel', 'Daniel', 'Даниил'],
  DEU: ['Deuteronomy', 'Tesniye', 'Второзаконие'],
  EPH: ['Ephesians', 'Efesliler', 'Ефесянам'],
  EXO: ['Exodus', 'Çıkış', 'Исход'],
  EZK: ['Ezekiel', 'Hezekiel', 'Иезекииль'],
  GAL: ['Galatians', 'Galatyalılar', 'Галатам'],
  GEN: ['Genesis', 'Yaratılış', 'Бытие'],
  HEB: ['Hebrews', 'İbraniler', 'Евреям'],
  ISA: ['Isaiah', 'Yeşaya', 'Исаия'],
  JAS: ['James', 'Yakup', 'Иакова'],
  JDG: ['Judges', 'Hakimler', 'Судей'],
  JER: ['Jeremiah', 'Yeremya', 'Иеремия'],
  JHN: ['John', 'Yuhanna', 'От Иоанна'],
  JOB: ['Job', 'Eyüp', 'Иов'],
  JOL: ['Joel', 'Yoel', 'Иоиль'],
  JON: ['Jonah', 'Yunus', 'Иона'],
  JOS: ['Joshua', 'Yeşu', 'Иисус Навин'],
  JUD: ['Jude', 'Yahuda', 'Иуды'],
  LUK: ['Luke', 'Luka', 'От Луки'],
  MAT: ['Matthew', 'Matta', 'От Матфея'],
  MIC: ['Micah', 'Mika', 'Михей'],
  MRK: ['Mark', 'Markos', 'От Марка'],
  NUM: ['Numbers', 'Çölde Sayım', 'Числа'],
  PHP: ['Philippians', 'Filipililer', 'Филиппийцам'],
  PRO: ['Proverbs', 'Özdeyişler', 'Притчи'],
  ROM: ['Romans', 'Romalılar', 'Римлянам'],
  S3Y: ['Song of the Three Young Men', 'Üç Gencin İlahisi', 'Песнь трёх отроков'],
  TIT: ['Titus', 'Titus', 'Титу'],
  WIS: ['Wisdom of Solomon', 'Süleyman’ın Bilgeliği', 'Премудрость Соломона'],
  ZEC: ['Zechariah', 'Zekeriya', 'Захария'],
  ZEP: ['Zephaniah', 'Sefanya', 'Софония'],
};

const INDEX: Record<BookLanguage, number> = { en: 0, tr: 1, ru: 2 };

export function hasBookName(code: string): boolean {
  return code in BOOKS;
}

export function bookName(code: string, language: BookLanguage): string {
  const names = BOOKS[code];
  return names ? names[INDEX[language]] : code;
}
