import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Gate `/admin/*` on the presence of a session cookie — the fastest possible
 * check (no round-trip). The role check happens in the admin layout via
 * `useSession`; the API re-checks everything server-side regardless
 * (docs/auth-and-database.md §12.2).
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // `/admin/invite/:token` is excluded — the landing page handles the
  // unauthenticated case itself (shows the invite, then a sign-in CTA).
  matcher: ["/admin/((?!invite/).)*"],
};
