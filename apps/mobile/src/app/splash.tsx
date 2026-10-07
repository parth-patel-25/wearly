import { ROUTES } from "@core/routing/routes";
import { WearlySplash } from "@features/splash/wearly-splash";
import { useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Boot brand moment.
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

  return <WearlySplash onComplete={go} />;
}
