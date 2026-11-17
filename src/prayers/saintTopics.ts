// What a user can ask a saint's help for. Ids only; labels and prayers live in the i18n layer.

export const SAINT_TOPICS = [
  'health',
  'family',
  'children',
  'marriage',
  'work',
  'travel',
  'study',
  'protection',
  'repentance',
  'temptation',
  'peace',
  'guidance',
  'patience',
  'gratitude',
] as const;

export type SaintTopicId = (typeof SAINT_TOPICS)[number];

export function isSaintTopic(value: unknown): value is SaintTopicId {
  return SAINT_TOPICS.includes(value as SaintTopicId);
}
