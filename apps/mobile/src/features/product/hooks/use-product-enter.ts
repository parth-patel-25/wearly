import { useHero } from "@wearly/ui-native/hero-provider";
import { useCallback, useEffect, useRef } from "react";
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * Product detail entrance — quick + together.
 *
 * One progress value drives everything so the parts stay in sync: the photo
 * slides up while scaling from 0.92 to 1 and fading in, the content sheet
 * rises from the bottom, the header back button slides in from the left and
 * the save button from the right. Every part also fades, as requested.
 *
 * Sequencing matters: when the screen was opened from Home via the hero, the
 * entrance waits until the overlay has finished expanding (`settled`).
 * Starting both at once shows two copies of the photo animating differently,
 * which reads as a stuck double-render. `playExit` mirrors the same values
 * backwards and replays the hero collapse on top, so back feels like enter
 * in reverse.
 */

const ENTER_MS = 280;
const EXIT_MS = 200;
const SETTLE_FALLBACK_MS = 600;
const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export function useProductEnter(pieceId: string) {
  const { startCollapse, state } = useHero();
  const reduceMotion = useReducedMotion() === true;
  const hasHero = state.targetId === pieceId && state.frame !== null;
  const overlayDone = state.phase !== "expanding";
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  const exitingRef = useRef(false);
  const startedRef = useRef(reduceMotion);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    if (!hasHero || overlayDone) {
      startedRef.current = true;
      progress.value = withTiming(1, { duration: ENTER_MS, easing: EASE });
    }
  }, [hasHero, overlayDone, progress]);

  // Safety: if the settle callback never lands, release the entrance anyway
  // instead of leaving the screen invisible.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        progress.value = withTiming(1, { duration: ENTER_MS, easing: EASE });
      }
    }, SETTLE_FALLBACK_MS);
    return () => clearTimeout(timeout);
  }, [progress]);

  const photoStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 28 },
      { scale: 0.92 + progress.value * 0.08 },
    ],
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 64 }],
  }));

  const leftButtonStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * -24 }],
  }));

  const rightButtonStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * 24 }],
  }));

  const playExit = useCallback(
    (done: () => void) => {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: ref flips true on first exit
      if (exitingRef.current) {
        return;
      }
      exitingRef.current = true;
      if (reduceMotion) {
        done();
        return;
      }
      startCollapse();
      progress.value = withTiming(
        0,
        { duration: EXIT_MS, easing: EASE },
        (finished) => {
          if (finished) {
            runOnJS(done)();
          }
        }
      );
    },
    [progress, reduceMotion, startCollapse]
  );

  return {
    leftButtonStyle,
    photoStyle,
    playExit,
    rightButtonStyle,
    sheetStyle,
  };
}
