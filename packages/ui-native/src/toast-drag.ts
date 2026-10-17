import { DURATION, EASE_OUT, SPRING } from "@wearly/design-tokens/motion";
import {
  Easing,
  type SharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

/**
 * The drag decision: what a released toast drag means.
 *
 * Kept to its own module because it is the one piece of the toast that must run
 * as a worklet. It reads the drag's shared values and the release velocity, and
 * either springs the surface home or sends it off along the axis the finger
 * committed to and starts the fade-out. Nothing here renders.
 */

/** Dragged this far (px) on release, and it lets go. */
export const DISMISS_DISTANCE = 110;
/** Flicked faster than this (px/s), and it lets go whatever the distance. */
const DISMISS_VELOCITY = 850;

/** The product's default curve, shared with the entrance in `toast-motion.ts`. */
export const TOAST_TIMING = {
  duration: DURATION.base,
  easing: Easing.bezier(...EASE_OUT),
};

/** The four numbers a fling decision needs, and nothing else. */
interface PanEndEvent {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
}

/** Everything the release logic touches, bundled so it threads as one arg. */
export interface PanContext {
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  hasClosed: SharedValue<boolean>;
  reduceMotion: boolean;
  visible: SharedValue<number>;
  width: number;
}

/**
 * A worklet, so velocity, threshold, destination and the exit all stay on the UI
 * thread with the finger.
 */
export function release(event: PanEndEvent, context: PanContext) {
  "worklet";
  const dx = context.dragX.value;
  const dy = context.dragY.value;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const distance = horizontal
    ? Math.abs(event.translationX)
    : Math.abs(event.translationY);
  const velocity = horizontal
    ? Math.abs(event.velocityX)
    : Math.abs(event.velocityY);
  const leaves = distance > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY;

  if (!leaves) {
    context.dragX.value =
      context.reduceMotion === true ? 0 : withSpring(0, SPRING.press);
    context.dragY.value =
      context.reduceMotion === true ? 0 : withSpring(0, SPRING.press);
    return;
  }

  if (context.reduceMotion === true) {
    context.hasClosed.value = true;
    return;
  }

  const offset = horizontal ? dx : dy;
  const destination = Math.sign(offset || 1) * context.width;
  if (horizontal) {
    context.dragX.value = withTiming(destination, TOAST_TIMING);
  } else {
    context.dragY.value = withTiming(destination, TOAST_TIMING);
  }
  context.visible.value = withTiming(0, TOAST_TIMING, (finished) => {
    if (finished) {
      context.hasClosed.value = true;
    }
  });
}
