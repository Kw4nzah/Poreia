// Data model of the Divine Liturgy reader. The structure and helpers live here; the texts live
// in optional data files (src/liturgy/data/<liturgy>.<language>.ts) that are loaded lazily.

/** Parts of the service, in reading order. Section titles come from the i18n layer. */
export const LITURGY_SECTIONS = ['proskomedia', 'catechumens', 'faithful', 'dismissal'] as const;
export type LiturgySection = (typeof LITURGY_SECTIONS)[number];

/** Who speaks a block. `rubric` is a direction (shown in italics), `omitted` a part not read. */
export const LITURGY_SPEAKERS = [
  'deacon',
  'priest',
  'choir',
  'reader',
  'people',
  'rubric',
  'omitted',
] as const;
export type LiturgySpeaker = (typeof LITURGY_SPEAKERS)[number];

export interface LiturgyBlock {
  /** Shared by every language, so two languages can be aligned block by block. */
  id: string;
  section: LiturgySection;
  who: LiturgySpeaker;
  text: string;
}

/** Texts: Church Slavonic, English, Russian, Turkish. */
export const LITURGY_LANGUAGES = ['cu', 'en', 'ru', 'tr'] as const;
export type LiturgyLanguage = (typeof LITURGY_LANGUAGES)[number];

/** Liturgies that exist (more later). */
export const LITURGY_IDS = ['chrysostom'] as const;
export type LiturgyId = (typeof LITURGY_IDS)[number];

/** Where a text comes from, in the three app languages; shown on the Sources screen. */
export interface LiturgySource {
  tr: string;
  en: string;
  ru: string;
}

/** What a data file exports: one language's text of one liturgy. */
export interface LiturgyData {
  blocks: readonly LiturgyBlock[];
  source: LiturgySource;
}

export type LiturgyLoaders = Partial<
  Record<LiturgyId, Partial<Record<LiturgyLanguage, () => Promise<LiturgyData>>>>
>;
