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
 * same control, this is where I am now".
 *
 * The pill fills its tab's slot exactly. It is deliberately *not* inset inside
 * the slot: a capsule inset on both sides of every tab reads as five separate
 * compartments with seams between them, which is the opposite of one bar with one
 * object moving in it.
 *
 * Position is **measured, never computed** — see `useTabFrames` in `./tab-bar`,
 * which is where the numbers come from.
 *
 * ### Why the width is a scale, not a width
 *
 * Animating `width` is a layout animation: the view is re-measured and
 * re-laid-out on every frame, which is why a width-animated pill drags behind
 * the `translateX` moving at the same time. Two properties, one smooth and one
 * not, is what makes a bar feel like it is fighting itself.
 *
 * So the layout `width` jumps straight to the new tab's width — one layout pass,
 * on the frame the press lands — and the *visual* width change is carried by a
 * `scaleX` that springs from `previousWidth / targetWidth` to `1`. A transform is
 * a pure paint operation, so the resize now runs at the display's frame rate
 * alongside the translation, and the two cannot desynchronise.
 *
 * `transformOrigin: "left"` anchors the scale to the left edge, which is what
 * keeps the pill's leading edge glued to its `translateX` while the trailing
 * edge stretches. Scaling a capsule does flatten its end caps very slightly;
 * with five equal slots the ratios are within a hair of `1`, so it is not
 * visible, and the alternative is a resize that stutters.
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
  /** Leading edge. The only thing that is genuinely animated as a position. */
  const x = useSharedValue(0);
  /**
   * The real layout width. Set outright, never animated — see the note above.
   * Reading and writing it is a single layout pass per tab change.
   */
  const width = useSharedValue(0);
  /** The visual width, as a multiple of `width`. Springs to `1`. */
  const scaleX = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  /**
   * Whether a tab has ever been measured. Without this the pill would animate
   * open from zero width every time the app launched, which reads as a flicker
   * rather than as an arrival.
   */
  const arrived = useRef(false);

  useEffect(() => {
    if (frame === undefined || frame.width <= 0) {
      return;
    }

    // First placement, or reduced motion: land on the value. Animating either
    // would mean showing the user a transition that is not one.
    if (reduceMotion === true || arrived.current === false) {
      arrived.current = true;
      x.value = frame.x;
      width.value = frame.width;
      scaleX.value = 1;
      return;
    }

    // Whatever the pill is actually showing right now — which mid-flight is not
    // `width.value`, because that has already been set to the target. Reading the
    // old target instead would make a rapid second tap start the resize from
    // where the pill used to be, and visibly jump.
    const from = width.value * scaleX.value;
    width.value = frame.width;
    scaleX.value = from / frame.width;
    scaleX.value = withSpring(1, SPRING.tabIndicator);

    // Assigning a new animation to a shared value that is already in flight
    // restarts it from wherever it currently is, rather than from the old
    // target. That is what makes rapid tapping between tabs track the finger
    // instead of queueing a backlog of transitions.
    x.value = withSpring(frame.x, SPRING.tabIndicator);
  }, [frame, reduceMotion, scaleX, width, x]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { scaleX: scaleX.value }],
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
      style={[animatedStyle, { transformOrigin: "left" }]}
    />
  );
}
