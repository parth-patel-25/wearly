import { getSessionCookie } from "better-auth/cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Root is an auth gate, not a page: no session cookie → sign in; any
 * cookie-holder → the admin dashboard (the admin shell still enforces the
 * real role check server-side via the API).
 */
export default async function Home() {
  const cookieStore = await cookies();
  // getSessionCookie's types only accept Request | Headers, but it also
  // handles a Next cookie store at runtime. Wrap the store's cookie header in
  // a Headers object to satisfy both.
  const header = new Headers();
  for (const cookie of cookieStore.getAll()) {
    header.append("cookie", `${cookie.name}=${cookie.value}`);
  }
  const hasSession = Boolean(getSessionCookie(header));
  redirect(hasSession ? "/admin" : "/sign-in");
}
