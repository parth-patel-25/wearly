/**
 * Motion hooks.
 *
 * Every animation in Wearly runs on the UI thread through Reanimated, and every
 * duration and spring comes from `@wearly/design-tokens/motion` so the native
 * numbers stay in lockstep with the CSS tokens the web app uses.
 *
 * The rule from the design system is that controls animate **colour** only, so
 * press feedback never nudges the surrounding layout. A transform is allowed in
 * exactly three places: the press scale below, which stays inside the control's
 * own bounds; the hero-expansion overlay; and the tab bar's active indicator,
 * which translates to a *measured* sibling position and so never displaces the
 * tabs themselves.
 */

import { DURATION, EASE_OUT, SPRING } from "@wearly/design-tokens/motion";
import { useCallback, useEffect } from "react";
import { Pressable } from "react-native";
import type { AnimatedStyle, SharedValue } from "react-native-reanimated";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ScaleStyle {
  transform: { scale: number }[];
}

/**
 * Reanimated-wrapped Pressable. Created once at module scope — wrapping inside a
 * component hands Reanimated a new component type on every render, which
 * silently drops the animation.
 */
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressScale {
  /** Spread onto the control: `style={animatedStyle}`. */
  animatedStyle: AnimatedStyle<ScaleStyle>;
  onPressIn: () => void;
  onPressOut: () => void;
  scale: SharedValue<number>;
}

/**
 * Press feedback for a tactile control: 1.0 → 0.97 → 1.0.
 *
 * Returns the handlers and the animated style together, so a caller cannot wire
 * up one and forget the other.
 */
export function usePressScale(pressedScale = 0.97): PressScale {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const onPressIn = useCallback(() => {
    scale.value =
      reduceMotion === true ? 1 : withSpring(pressedScale, SPRING.press);
  }, [pressedScale, reduceMotion, scale]);

  const onPressOut = useCallback(() => {
    scale.value = reduceMotion === true ? 1 : withSpring(1, SPRING.press);
  }, [reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut, scale };
}

export interface HeartPop {
  /** Fire from the press handler, not from an effect. */
  animatedStyle: AnimatedStyle<ScaleStyle>;
  pop: () => void;
  scale: SharedValue<number>;
}

/**
 * The favourite heart. Scaling past 1 and settling back gives the small pop that
 * makes a toggle feel like something happened, rather than a state flip.
 *
 * Under reduced motion the state still changes — only the movement is dropped.
 */
export function useHeartPop(): HeartPop {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const pop = useCallback(() => {
    if (reduceMotion === true) {
      scale.value = withTiming(1, { duration: DURATION.instant });
      return;
    }
    scale.value = withSpring(1.25, SPRING.pop);
    scale.value = withSpring(1, SPRING.pop);
  }, [reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, pop, scale };
}

/**
 * Gate for entrance animations. Returns `false` when the user has asked for
 * reduced motion, so callers render the end state directly instead of animating
 * toward it.
 */
export function useEnterAnimation(): boolean {
  return useReducedMotion() !== true;
}

/** The product's default curve, built from the token rather than re-typed. */
const EASE = Easing.bezier(...EASE_OUT);

export interface FadeInOptions {
  /** Milliseconds to wait before starting. */
  delay?: number;
  /** How far below its final position it starts, in pixels. */
  distance?: number;
}

/**
 * A fade-and-rise entrance that cannot leave content invisible.
 *
 * Reanimated's `entering={FadeIn}` looks tidier, but its starting state is
 * `opacity: 0` and it relies on the layout animation running. If it does not —
 * a reduced-motion path, a worklet that has not attached yet, a fast refresh
 * mid-transition — the content stays at zero and the screen is simply blank.
 * That failure mode is invisible in code review and obvious to a user.
 *
 * So this animates two shared values from an effect instead: under reduced
 * motion both start at their final value, and the animated style is applied by
 * this hook rather than by a prop.
 */
export function useFadeIn({ delay = 0, distance = 8 }: FadeInOptions = {}) {
  const shouldAnimate = useEnterAnimation();
  const opacity = useSharedValue(shouldAnimate ? 0 : 1);
  const offset = useSharedValue(shouldAnimate ? distance : 0);

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }
    const timing = { duration: DURATION.slow, easing: EASE };
    opacity.value = withDelay(delay, withTiming(1, timing));
    offset.value = withDelay(delay, withTiming(0, timing));
  }, [delay, offset, opacity, shouldAnimate]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));
}
