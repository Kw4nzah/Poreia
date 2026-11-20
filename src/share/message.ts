// The text sent when a passage, prayer or reading is shared. Pure so it can be tested.

export const SHARE_SIGNATURE = 'Poreia';

/** The passage, a blank line, then one source line ("name · Poreia"). No personal data. */
export function buildShareMessage(text: string, source: string): string {
  const body = text.replace(/\r\n/g, '\n').trim();
  const from = [source.trim(), SHARE_SIGNATURE].filter((part) => part !== '').join(' · ');
  return body === '' ? from : `${body}\n\n— ${from}`;
}
