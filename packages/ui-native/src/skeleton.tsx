import { type ReactNode, useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

/**
 * Placeholder block for loading content. Pulses gently; under reduced motion it
 * stays static so the screen remains legible without movement.
 *
 * The loop is started from an effect, never from the render body: assigning to
 * a shared value while React is rendering trips Reanimated's dev-time
 * "Writing to `value` during component render" warning (and re-rendering would
 * restart the animation mid-pulse).
 */
export interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export function Skeleton({ className, children }: SkeletonProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion === true) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(opacity);
      opacity.value = 1;
    };
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className={className ? `rounded-md bg-muted ${className}` : "rounded-md bg-muted"}
      style={animatedStyle}
    >
      {children}
    </Animated.View>
  );
}

export { Skeleton as default };
