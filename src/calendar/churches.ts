// A church is described by two independent choices, so new jurisdictions
// (Antioch, Georgia, Serbia, ...) can be added as plain data.

/** Calendar used for fixed feasts. Pascha always follows the Julian paschalion. */
export type FixedCalendar = 'julian' | 'revisedJulian';

/** Which set of fasting customs is applied. */
export type FastingPractice = 'greek' | 'slavic';

export interface Church {
  id: string;
  fixedCalendar: FixedCalendar;
  practice: FastingPractice;
}

export const CHURCHES = {
  greek: { id: 'greek', fixedCalendar: 'revisedJulian', practice: 'greek' },
  russian: { id: 'russian', fixedCalendar: 'julian', practice: 'slavic' },
} as const satisfies Record<string, Church>;

export type ChurchId = keyof typeof CHURCHES;
