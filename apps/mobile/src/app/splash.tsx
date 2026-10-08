import { ROUTES } from "@core/routing/routes";
import { WearlySplash } from "@features/splash/wearly-splash";
import { useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Boot brand moment.
 *
 * PREVIEW: `loop` holds the splash and replays the performance so it can be
 * watched properly — tap replays on demand, and it never navigates away.
 * Remove `loop` to restore the shipping behavior (play once, then welcome).
 *
 * The splash introduces Wearly and routes onwards — first run continues to
 * the welcome personalisation, never to a login wall. The handover fires
 * exactly once; returning from the background never replays it, because this
 * route is replaced rather than stacked.
 */
export default function SplashScreen() {
  const router = useRouter();

  const go = useCallback(() => {
    router.replace(ROUTES.welcome);
  }, [router]);

  return <WearlySplash loop onComplete={go} />;
}
