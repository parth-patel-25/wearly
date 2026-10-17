import { useCallback, useEffect, useMemo, useRef } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  DISMISS_DISTANCE,
  type PanContext,
  release,
  TOAST_TIMING,
} from "./toast-drag";

/**
 * Everything about a toast that is motion: the entrance, the exit, the drag and
 * the timer, kept apart from `toast-view.tsx` so the surface file is only the
 * surface.
 *
 * One `visible` value drives entrance, exit and resting scale together, so the
 * three can never disagree. The drag tracks the finger 1:1 on the UI thread and
 * fades as it travels; the release decision itself lives in `toast-drag.ts`.
 * `onDismissed` fires only after the exit finishes, which lets the provider
 * unmount without a pop.
 */

/** How long a toast rests before it leaves on its own. */
const VISIBLE_MS = 4000;
/** How far above its resting spot the surface begins. */
const ENTER_DISTANCE = 14;

/** The provider's handle on the surface's exit, filled in on mount. */
export interface ToastCloseHandle {
  current: (() => void) | null;
}

interface ToastMotionOptions {
  closeRef: ToastCloseHandle;
  onDismissed: () => void;
}

export function useToastMotion({ closeRef, onDismissed }: ToastMotionOptions) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  // 0 hidden → 1 resting. The single source of truth for the surface's state.
  const visible = useSharedValue(reduceMotion === true ? 1 : 0);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const hasClosed = useSharedValue(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // Safe to call more than once: `hasClosed` flips once, and a repeat simply
  // restarts the same fade rather than firing a second dismissal.
  const close = useCallback(() => {
    clearTimer();
    if (reduceMotion === true) {
      hasClosed.value = true;
      return;
    }
    visible.value = withTiming(0, TOAST_TIMING, (finished) => {
      if (finished) {
        hasClosed.value = true;
      }
    });
  }, [clearTimer, hasClosed, reduceMotion, visible]);

  // The only crossing back into JS. The drag, the exit and the spring-back all
  // stay on the UI thread; this reaction watches the one flag they share, and
  // is re-registered whenever the callback changes.
  useAnimatedReaction(
    () => hasClosed.value,
    (closed, previous) => {
      if (closed === true && previous !== true) {
        runOnJS(onDismissed)();
      }
    },
    [onDismissed]
  );

  useEffect(() => {
    closeRef.current = close;
    if (reduceMotion !== true) {
      visible.value = withTiming(1, TOAST_TIMING);
    }
    timer.current = setTimeout(close, VISIBLE_MS);
    return () => {
      closeRef.current = null;
      clearTimer();
    };
  }, [clearTimer, close, closeRef, reduceMotion, visible]);

  const pan = useMemo(() => {
    const context: PanContext = {
      dragX,
      dragY,
      hasClosed,
      reduceMotion: reduceMotion === true,
      visible,
      width,
    };
    return (
      Gesture.Pan()
        // Below this the press belongs to the `Pressable` underneath, so a tap
        // is still a tap and only a real drag is claimed.
        .minDistance(12)
        .onUpdate((event) => {
          dragX.value = event.translationX;
          dragY.value = event.translationY;
        })
        .onEnd((event) => release(event, context))
    );
  }, [dragX, dragY, hasClosed, reduceMotion, visible, width]);

  const surfaceStyle = useAnimatedStyle(() => {
    const progress = visible.value;
    const travelled = Math.max(Math.abs(dragX.value), Math.abs(dragY.value));
    // Fade towards — never to — zero while dragged, so it reads as "leaving".
    const fade = 1 - Math.min(travelled / (DISMISS_DISTANCE * 2), 0.6);
    return {
      opacity: progress * fade,
      transform: [
        { translateX: dragX.value },
        { translateY: dragY.value - (1 - progress) * ENTER_DISTANCE },
        { scale: 0.96 + progress * 0.04 },
      ],
    };
  });

  return { close, pan, surfaceStyle };
}
