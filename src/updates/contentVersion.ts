// Tells the user which content bundle is running. The APK version never changes with
// over-the-air updates, so the release time of the bundle is the only visible "version".

import { formatDate, type Messages } from '../i18n';

/** "16 Nov 2026, 20:27" in the device's local time, or the "as shipped" text. */
export function describeContent(m: Messages, isEmbedded: boolean, createdAt: Date | null): string {
  if (isEmbedded || !createdAt || Number.isNaN(createdAt.getTime())) return m.settings.contentShipped;
  const date = formatDate(m, {
    year: createdAt.getFullYear(),
    month: createdAt.getMonth() + 1,
    day: createdAt.getDate(),
  });
  const time = `${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}`;
  return m.settings.contentUpdated(`${date}, ${time}`);
}
