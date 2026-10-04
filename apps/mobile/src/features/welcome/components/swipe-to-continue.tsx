import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  Animated,
  PanResponder,
  useWindowDimensions,
  View,
} from "react-native";

/**
 * Swipe to continue.
 *
 * A drag gate, used once — on onboarding step 1, where the screen is pure
 * introduction and nothing is being asked of the user. Steps 2 and 3 keep their
 * buttons: a screen that offers four answers and then refuses to let you tap
 * through them is hostile, and a swipe is a bad price for a flourish.
 *
 * The drag runs on `PanResponder` and the classic `Animated` API. Travel is
 * the visible track's own width less the fixed thumb — reported by the track
 * itself via `onLayout`, so the thumb comes to rest flush with the inner edge
 * instead of stopping short or overshooting on an assumed number. Nothing runs
 * on the UI thread. That is deliberate: an earlier worklet-driven
 * implementation froze on a measured travel stuck at 0, and a `PanResponder`
 * has no travel value to get stuck.
 *
 * The one coupling: `THUMB_WIDTH` is fixed, so a longer label needs a wider
 * thumb in the same edit.
 *
 * **No tap fallback, by decision** — the one real cost. See
 * `docs/DESIGN_SYSTEM.md` §10 for why it was accepted here and why it must not
 * become a pattern.
 */

export interface SwipeToContinueProps {
  /** The label inside the travelling thumb. */
  label: string;
  onComplete: () => void;
}

const THUMB_WIDTH = 140;
const THUMB_HEIGHT = 44;
/** Must agree with the track's `p-1.5` (6px) — travel stops flush at it. */
const TRACK_INSET = 6;
const THRESHOLD = 0.6;

/**
 * Both page gutters. Must agree with the `px-4` on the welcome screen
 * (space-4, 16px a side) — the track is the screen less its insets rather than
 * a guessed percentage.
 */
const PAGE_GUTTER = 32;

function fire(style: ImpactFeedbackStyle): void {
  // A haptic must never delay the interaction it accompanies, and a device
  // without a taptic engine rejects rather than throws.
  impactAsync(style).catch(() => {
    /* no haptics on this device */
  });
}

export function SwipeToContinue({ label, onComplete }: SwipeToContinueProps) {
  const { width: screen } = useWindowDimensions();
  // The track reports its own width. Until the first layout lands, fall back
  // to the explicit arithmetic (screen less both `px-4` gutters) so
  // the control is usable on its very first frame.
  const [trackWidth, setTrackWidth] = useState(0);
  const onTrackLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);
  const scrollDistance = Math.max(
    0,
    (trackWidth > 0 ? trackWidth : screen - PAGE_GUTTER) -
      THUMB_WIDTH -
      TRACK_INSET * 2
  );

  const offset = useRef(new Animated.Value(0)).current;
  const travelled = useRef(0);
  const dragStart = useRef(0);
  const latestComplete = useRef(onComplete);

  useEffect(() => {
    latestComplete.current = onComplete;
  }, [onComplete]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        // Horizontal intent belongs to the thumb; vertical belongs to whoever
        // scrolls above it.
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          // Re-clamped: a rotation between drags can leave the stored position
          // past the new end-stop.
          dragStart.current = Math.min(travelled.current, scrollDistance);
          fire(ImpactFeedbackStyle.Light);
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.min(
            Math.max(dragStart.current + gesture.dx, 0),
            scrollDistance
          );
          travelled.current = next;
          offset.setValue(next);
        },
        // Single-fire by construction: release fires once per gesture and
        // completing unmounts this screen.
        onPanResponderRelease: () => {
          if (
            scrollDistance > 0 &&
            travelled.current >= scrollDistance * THRESHOLD
          ) {
            fire(ImpactFeedbackStyle.Medium);
            Animated.spring(offset, {
              friction: 7,
              tension: 300,
              toValue: scrollDistance,
              useNativeDriver: false,
            }).start();
            latestComplete.current();
            return;
          }
          Animated.spring(offset, {
            friction: 7,
            tension: 300,
            toValue: 0,
            useNativeDriver: false,
          }).start();
        },
        // The parent took the gesture mid-drag (release and terminate never
        // fire for the same gesture): put the thumb home.
        onPanResponderTerminate: () => {
          Animated.spring(offset, {
            friction: 7,
            tension: 300,
            toValue: 0,
            useNativeDriver: false,
          }).start();
        },
        onStartShouldSetPanResponder: () => false,
      }),
    [offset, scrollDistance]
  );

  const chevronOpacity = offset.interpolate({
    inputRange: [0, Math.max(scrollDistance, 1)],
    outputRange: [1, 0.25],
  });

  return (
    <View
      accessibilityHint="Swipe the handle to the right to continue"
      accessibilityLabel="Continue to the next step"
      accessibilityRole="button"
      className="w-full flex-row items-center rounded-pill border border-border bg-card p-1.5"
      onLayout={onTrackLayout}
    >
      <Animated.View
        {...pan.panHandlers}
        style={{
          elevation: 1,
          height: THUMB_HEIGHT,
          transform: [{ translateX: offset }],
          width: THUMB_WIDTH,
          zIndex: 1,
        }}
      >
        <View className="h-full w-full flex-row items-center justify-center rounded-pill bg-primary px-1">
          <Text tone="primary-foreground" variant="buttonXl">
            {label}
          </Text>
        </View>
      </Animated.View>

      {/* Two glyphs, not one, because `chevron-right` is a single arrow and the
          design calls for a doubled one. They sit side by side rather than
          overlapped — overlapping a flex row needs a negative margin, and the
          fade carries the motion here, not the spacing. */}
      <Animated.View
        className="flex-1 flex-row items-center justify-end pr-3"
        style={{ opacity: chevronOpacity, zIndex: 0 }}
      >
        <Icon name="chevron-right" size="sm" tone="muted-foreground" />
        <Icon name="chevron-right" size="sm" tone="muted-foreground" />
      </Animated.View>
    </View>
  );
}
