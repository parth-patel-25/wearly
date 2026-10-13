import { DURATION, EASE_OUT } from "@wearly/design-tokens/motion";
import { Text } from "@wearly/ui-native/text";
import { useEffect, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * Segmented tab switch with a travelling pill.
 *
 * Switching is a slide, not a swap: a `bg-card` pill glides between the two
 * segments' measured slots on `DURATION.base`/`EASE_OUT` — the tab bar's
 * indicator contract, one level down (see `docs/DESIGN_SYSTEM.md` §10). The
 * pill is the sanctioned kind of absolute surface: an overlay anchored to
 * its siblings' measured positions, never a way to arrange the row — there
 * is no flexbox way to slide a highlight between two slots without
 * displacing the labels, which is the entire point of it.
 *
 * Slots are measured, not computed: two `flex-1` segments would *usually*
 * split the track evenly, but "usually" is doing real work in that sentence
 * — flex distribution is not guaranteed to stay uniform once anything is
 * measured in pixels, and a rotation re-lays-out the row. Asking each
 * segment where it landed is the only version that stays true at every
 * width. Rapid taps retarget the in-flight timing rather than queueing, so
 * the pill tracks the intent.
 */

export type AuthTab = "login" | "signup";

const SEGMENTS: { id: AuthTab; label: string }[] = [
  { id: "login", label: "Log In" },
  { id: "signup", label: "Sign Up" },
];

const EASE = Easing.bezier(...EASE_OUT);

interface Slot {
  width: number;
  x: number;
}

export interface SegmentedTabsProps {
  active: AuthTab;
  onChange: (tab: AuthTab) => void;
}

export function SegmentedTabs({ active, onChange }: SegmentedTabsProps) {
  const reduceMotion = useReducedMotion();
  const [slots, setSlots] = useState<Partial<Record<AuthTab, Slot>>>({});
  // 0 = first segment, 1 = second. Starts parked on the active tab, so a
  // route that opens on signup never animates the pill across on mount.
  const progress = useSharedValue(active === "signup" ? 1 : 0);

  // One stable handler per segment, built once — a fresh `onLayout`
  // identity each render re-fires layout each render.
  const measure = useMemo(
    () =>
      Object.fromEntries(
        SEGMENTS.map(({ id }) => [
          id,
          ({ nativeEvent }: LayoutChangeEvent) => {
            const { width, x } = nativeEvent.layout;
            setSlots((previous) => {
              const existing = previous[id];
              // Layout re-fires on every parent re-render and rotation; only
              // a real change is a state update.
              if (
                existing !== undefined &&
                existing.width === width &&
                existing.x === x
              ) {
                return previous;
              }
              return { ...previous, [id]: { width, x } };
            });
          },
        ])
      ) as Record<AuthTab, (event: LayoutChangeEvent) => void>,
    []
  );

  useEffect(() => {
    const target = active === "signup" ? 1 : 0;
    progress.value =
      reduceMotion === true
        ? target
        : withTiming(target, { duration: DURATION.base, easing: EASE });
  }, [active, progress, reduceMotion]);

  const pillStyle = useAnimatedStyle(() => {
    const first = slots.login;
    const second = slots.signup;
    // Invisible until both slots have reported; the labels stay usable.
    if (first === undefined || second === undefined) {
      return { opacity: 0 };
    }
    // Both axes are transforms, never `left`/`width` per frame: `left` is a
    // layout property, so animating it re-measures the view every frame and
    // the travel visibly drags. Transform is pure paint.
    return {
      opacity: 1,
      transform: [
        { translateX: first.x + (second.x - first.x) * progress.value },
      ],
      width: first.width + (second.width - first.width) * progress.value,
    };
  });

  return (
    // The track owns the chrome (border, bg, rounding) but is *not* the pill's
    // positioning context: an absolute `left-0` child's base position includes
    // the parent's border but not its padding (RN's Yoga errata), while a
    // segment's `onLayout.x` includes both — so the pill would drag by the
    // border width. The inner row has neither, making `slot.x` and the pill's
    // origin the same zero.
    <View className="rounded-pill border border-border bg-muted p-1">
      <View className="flex-row gap-1">
        {/* Painted first, so it sits behind both labels; `pointerEvents`
            stops it swallowing a tap meant for a segment. */}
        <Animated.View
          aria-hidden
          className="absolute top-0 bottom-0 left-0 rounded-pill bg-card"
          pointerEvents="none"
          style={pillStyle}
        />
        {SEGMENTS.map(({ id, label }) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active === id }}
            className="h-10 flex-1 items-center justify-center rounded-pill"
            key={id}
            onLayout={measure[id]}
            onPress={() => onChange(id)}
          >
            <Text
              tone={active === id ? "foreground" : "muted-foreground"}
              variant="label"
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
