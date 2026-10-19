import { openURL } from "expo-linking";
import { openBrowserAsync } from "expo-web-browser";

/**
 * Open a configured destination.
 *
 * Web links open in the in-app browser so the user keeps their place in the
 * app; every other scheme (a `mailto:`, for instance) goes to the system. The
 * return value lets the caller surface a toast instead of failing silently when
 * nothing can handle the URL.
 */

const WEB_URL = /^https?:\/\//i;

export async function openExternal(url: string): Promise<boolean> {
  try {
    if (WEB_URL.test(url)) {
      await openBrowserAsync(url);
      return true;
    }
    await openURL(url);
    return true;
  } catch {
    return false;
  }
}
