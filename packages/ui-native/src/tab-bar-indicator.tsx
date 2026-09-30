import { SPRING } from "@wearly/design-tokens/motion";
import { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

/**
 * The sliding active indicator.
 *
 * A colour change alone tells you which tab is active but not that anything
 * moved, and the movement is the part that reads as polished. So the pill
 * travels to the active tab rather than blinking on and off in place.
 *
 * **One** indicator, not five backgrounds. That is the whole point: a bar where
 * each tab lights up independently reads as "the old tab went away and a new tab
 * appeared", while a single pill crossing the bar reads as "I am still in the
 * same control, this is where I am now". Everything the user needs to know about
 * continuity comes from this one object moving.
 *
 * Position is **measured, never computed** — see `useTabFrames` in `./tab-bar`,
 * which is where the numbers come from.
 *
 * It animates `width` as well as position, because a tab's frame is measured
 * rather than assumed: equal slots today, but a longer label in another
 * language, a rotation, or a future per-tab badge would all change it. One
 * `Animated.View` with a UI-thread animation is cheap enough at five tabs that
 * the layout prop is not worth contorting into a scale transform.
 *
 * `SPRING.tabIndicator` rather than the product's default timing curve: a pill
 * crossing the bar is a physical object, and a decelerating curve stops it dead
 * on arrival in a way that reads as a state change. The spring's overshoot is
 * under 1% — enough to soften the landing, not enough to wobble.
 */

export interface TabFrame {
  width: number;
  x: number;
}

export interface TabBarIndicatorProps {
  /** The active tab's frame, or `undefined` before anything has been measured. */
  frame?: TabFrame;
}

export function TabBarIndicator({ frame }: TabBarIndicatorProps) {
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  /**
   * Whether a tab has ever been measured. Without this the pill would animate
   * open from zero width every time the app launched, which reads as a flicker
   * rather than as an arrival.
   */
  const arrived = useRef(false);

  useEffect(() => {
    if (frame === undefined) {
      return;
    }

    // First placement, or reduced motion: land on the value. Animating either
    // would mean showing the user a transition that is not one.
    if (reduceMotion === true || arrived.current === false) {
      arrived.current = true;
      x.value = frame.x;
      width.value = frame.width;
      return;
    }

    // Assigning a new animation to a shared value that is already in flight
    // restarts it from wherever it currently is, rather than from the old
    // target. That is what makes rapid tapping between tabs track the finger
    // instead of queueing a backlog of transitions.
    x.value = withSpring(frame.x, SPRING.tabIndicator);
    width.value = withSpring(frame.width, SPRING.tabIndicator);
  }, [frame, reduceMotion, width, x]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: width.value,
  }));

  // Absolutely positioned and painted first, so it sits behind every tab. That is
  // the sanctioned kind of absolute surface: an overlay anchored to its siblings,
  // not a way of arranging the row. `pointerEvents` stops it swallowing a tap
  // meant for the tab underneath.
  return (
    <Animated.View
      className="absolute top-0 bottom-0 left-0 rounded-pill bg-muted"
      pointerEvents="none"
      style={animatedStyle}
    />
  );
}
