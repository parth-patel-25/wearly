import { focusManager } from "@tanstack/react-query";
import { type FocusManager, kFocusManager } from "better-auth/client";
import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

/**
 * Focus refetch for native — the mobile half of README §Data fetching and
 * refetch policy.
 *
 * `refetchOnWindowFocus` is TanStack Query's contract for "the data came back
 * into view, show me the current version", but its default trigger is
 * `visibilitychange`, which never fires outside a browser. Native therefore
 * supplies the two focus moments a phone actually has, and feeds them to both
 * global managers so the one hook covers queries and the auth session:
 *
 * 1. **Route change** — Home → Profile is this app's tab-switch. It is the
 *    closest native equivalent of a browser tab regaining focus.
 * 2. **`AppState` → `active`** — the app itself returned to the foreground.
 *
 * Both calls are idempotent, and Better Auth additionally ignores focus
 * refetches inside a 5 second window, so a fast run across four tabs costs one
 * session request rather than four.
 *
 * Better Auth also refuses a focus refetch when its online manager reports the
 * device as offline. Native has no `navigator.onLine`, so that gate is
 * corrected next door by `use-auth-online-state.ts` — without it this hook's
 * events are caught and then silently discarded.
 */
export function useFocusRefetch(): void {
  const pathname = usePathname();
  // The first run is the app's own mount: every query is fetching for the
  // first time and Better Auth has just requested the session, so a focus
  // signal there would only duplicate work.
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refetchOnFocus();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (lastPathname.current === pathname) {
      return;
    }
    lastPathname.current = pathname;
    refetchOnFocus();
  }, [pathname]);
}

function refetchOnFocus(): void {
  focusManager.onFocus();

  // Better Auth refreshes `/get-session` from its own focus manager rather
  // than TanStack's, so Profile shows the fresh account state too. The manager
  // is a `Symbol.for` global created on first `useSession`; before that there
  // is nothing listening and nothing to refresh.
  const authFocus = (globalThis as unknown as FocusGlobals)[kFocusManager];
  authFocus?.setFocused(true);
}

interface FocusGlobals {
  [kFocusManager]?: FocusManager;
}
