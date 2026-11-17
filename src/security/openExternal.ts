// The one function that opens a link outside the app. Every Linking.openURL call goes through here.

import { Linking } from 'react-native';
import { isAllowedExternalUrl } from './externalLinks';

/** Opens an allowlisted https link in the browser or the matching app. Never throws. */
export async function openExternalUrl(url: string): Promise<boolean> {
  if (!isAllowedExternalUrl(url)) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
