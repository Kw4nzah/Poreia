// The categories of the Settings hub. Each opens its own screen at /settings/<id>.

import type { Messages } from '../../i18n';

export const SECTION_IDS = [
  'profile',
  'language',
  'notifications',
  'saints',
  'history',
  'backup',
  'updates',
  'bugReport',
  'about',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === 'string' && (SECTION_IDS as readonly string[]).includes(value);
}

/** Screen title of a category, also its row title in the hub. */
export function sectionTitle(m: Messages, id: SectionId): string {
  switch (id) {
    case 'profile':
      return m.settings.sectionProfile;
    case 'language':
      return m.settings.language;
    case 'notifications':
      return m.settings.notificationsTitle;
    case 'saints':
      return m.saints.title;
    case 'history':
      return m.report.title;
    case 'backup':
      return m.backup.title;
    case 'updates':
      return m.settings.updatesTitle;
    case 'bugReport':
      return m.bugReport.title;
    case 'about':
      return m.settings.sectionAbout;
  }
}

export function hourLabel(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}
