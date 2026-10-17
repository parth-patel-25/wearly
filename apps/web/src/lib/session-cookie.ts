import { getSessionCookie } from "better-auth/cookies";
import { cookies } from "next/headers";

/**
 * Presence-only check for the Better Auth session cookie (it does not validate
 * the token — the API does that on every call). Used by the auth gate and by
 * the sign-in page so a signed-in user is never shown the sign-in form.
 *
 * `getSessionCookie`'s types only accept `Request | Headers`, but it also
 * handles a Next cookie store at runtime. Wrap the store's cookie header in a
 * `Headers` object to satisfy both.
 */
export async function hasSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const header = new Headers();
  for (const cookie of cookieStore.getAll()) {
    header.append("cookie", `${cookie.name}=${cookie.value}`);
  }
  return Boolean(getSessionCookie(header));
}
