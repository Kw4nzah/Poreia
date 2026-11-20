// The last crash caught by the ErrorBoundary, kept on the phone so the person can attach it to a
// problem report. Only the error name and a short, cleaned message are kept, never a component stack
// (it could carry what the user typed). Nothing leaves the phone unless the person sends the report.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const LAST_ERROR_KEY = 'poreia.lastError';
const MAX_MESSAGE = 160;

export interface LastError {
  /** ISO time of the crash. */
  at: string;
  name: string;
  message: string;
}

/** A short single-line text from anything thrown; control characters and long digit runs removed. */
export function cleanErrorText(value: unknown, max = MAX_MESSAGE): string {
  const text = typeof value === 'string' ? value : '';
  return text
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\d{5,}/g, '#')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
}

export function toLastError(error: unknown, now: Date = new Date()): LastError {
  const e = (error ?? {}) as { name?: unknown; message?: unknown };
  return {
    at: now.toISOString(),
    name: cleanErrorText(e.name, 40) || 'Error',
    message: cleanErrorText(e.message),
  };
}

/** One line for the report: "TypeError: x is undefined (2026-11-20T19:14:43Z)". */
export function describeLastError(error: LastError): string {
  const head = error.message ? `${error.name}: ${error.message}` : error.name;
  return `${head} (${error.at.slice(0, 19)}Z)`;
}

/** Reads the stored record; anything unreadable is "no error". Never throws. */
export function parseLastError(raw: string | null): LastError | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    if (!v || typeof v !== 'object') return null;
    const at = typeof v.at === 'string' && !Number.isNaN(Date.parse(v.at)) ? v.at : null;
    if (!at) return null;
    return { at, name: cleanErrorText(v.name, 40) || 'Error', message: cleanErrorText(v.message) };
  } catch {
    return null;
  }
}

export async function saveLastError(error: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_ERROR_KEY, JSON.stringify(toLastError(error)));
  } catch {
    // Not remembering a crash is harmless.
  }
}

export async function loadLastError(): Promise<LastError | null> {
  try {
    return parseLastError(await AsyncStorage.getItem(LAST_ERROR_KEY));
  } catch {
    return null;
  }
}

export async function clearLastError(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_ERROR_KEY);
  } catch {
    // Nothing to do.
  }
}
