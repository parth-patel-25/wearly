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
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable } from "react-native";

import { WearlyLogoAnimation } from "./components/wearly-logo-animation";
import { SPLASH_REDUCED_MS, SPLASH_TOTAL_MS } from "./splash-timing";

export interface WearlySplashProps {
  /**
   * Preview mode: hold the splash and replay the performance in a loop
   * instead of handing over. A tap replays on demand. Dev testing only —
   * never on in production.
   */
  loop?: boolean;
  /** Fired exactly once when the splash hands over. */
  onComplete: () => void;
}

export function WearlySplash({ loop = false, onComplete }: WearlySplashProps) {
  const animate = useEnterAnimation();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cycle, setCycle] = useState(0);

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
    if (loop) {
      return;
    }
    timer.current = setTimeout(
      finish,
      animate ? SPLASH_TOTAL_MS : SPLASH_REDUCED_MS
    );
    return () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, [animate, finish, loop]);

  // Preview loop: remount the animation every performance so it replays from
  // a clean state. Remounting (not resetting shared values) is what keeps the
  // replay identical to a first run.
  useEffect(() => {
    if (!(loop && animate)) {
      return;
    }
    const interval = setInterval(() => {
      setCycle((current) => current + 1);
    }, SPLASH_TOTAL_MS);
    return () => clearInterval(interval);
  }, [animate, loop]);

  const replay = useCallback(() => {
    setCycle((current) => current + 1);
  }, []);

  return (
    <Screen
      className="flex-1 bg-background"
      contentClassName="flex grow flex-col"
      scrollable={false}
    >
      <Pressable
        accessibilityHint={
          loop ? "Replays the introduction" : "Skips the introduction"
        }
        accessibilityLabel={loop ? "Replay intro" : "Skip intro"}
        accessibilityRole="button"
        className="flex grow items-center justify-center px-gutter"
        onPress={loop ? replay : finish}
      >
        <WearlyLogoAnimation key={cycle} loop={loop} />
      </Pressable>
    </Screen>
  );
}
