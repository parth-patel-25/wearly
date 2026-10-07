/**
 * The splash.
 *
 * Wearly's one allowed brand moment: the fabric reveal plays, then hands
 * over through `onComplete`. It moves on by itself so a slow device never
 * strands anyone, it can be tapped past immediately, and `onComplete` fires
 * exactly once even if the component unmounts mid-performance.
 *
 * The animation never gates app initialization — whatever route comes next
 * is already ready and only waits for the handover.
 */

import { useEnterAnimation } from "@wearly/ui-native/motion";
import { Screen } from "@wearly/ui-native/screen";
import { useCallback, useEffect, useRef } from "react";
import { Pressable } from "react-native";

import { WearlyLogoAnimation } from "./components/wearly-logo-animation";
import { SPLASH_REDUCED_MS, SPLASH_TOTAL_MS } from "./splash-timing";

export interface WearlySplashProps {
  /** Fired exactly once when the splash hands over. */
  onComplete: () => void;
}

export function WearlySplash({ onComplete }: WearlySplashProps) {
  const animate = useEnterAnimation();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Exactly-once handover: the first trigger (timer or tap) clears the timer
  // and claims the handover; every later call finds nothing to claim. The
  // effect cleanup clears the pending timer, so an unmounted splash can never
  // fire after it is gone.
  const finish = useCallback(() => {
    if (timer.current === null) {
      return;
    }
    clearTimeout(timer.current);
    timer.current = null;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    timer.current = setTimeout(
      finish,
      animate ? SPLASH_TOTAL_MS : SPLASH_REDUCED_MS
    );
    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, [animate, finish]);

  return (
    <Screen
      className="flex-1 bg-background"
      contentClassName="flex grow flex-col"
      scrollable={false}
    >
      <Pressable
        accessibilityHint="Skips the introduction"
        accessibilityLabel="Skip intro"
        accessibilityRole="button"
        className="flex grow items-center justify-center px-gutter"
        onPress={finish}
      >
        <WearlyLogoAnimation />
      </Pressable>
    </Screen>
  );
}
