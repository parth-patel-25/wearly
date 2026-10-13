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
 * Swipe to confirm.
 *
 * The submit control for the auth forms: a white pill track with a primary
 * ball, and a primary fill that grows behind the ball as it travels — by the
 * end the whole track has turned primary. The ball carries a card-coloured
 * ring so it stays a circle instead of dissolving into the fill it is painting.
 *
 * Two labels, exactly aligned: the resting one in foreground tones on the
 * white track, and a second inside the fill that is revealed as the fill
 * covers the first. Text colour cannot interpolate per-glyph, so the reveal
 * does it instead.
 *
 * `PanResponder` + classic `Animated`, like the welcome swipe — see
 * `docs/DESIGN_SYSTEM.md` §10. It ships the standard `activate` action, so
 * a screen-reader user confirms by activation instead of facing a drag.
 */

export interface SwipeToConfirmProps {
  /** The centred instruction, e.g. "Swipe to Login". */
  label: string;
  /** Runs once per completed gesture — validate, then act or reject. */
  onComplete: () => void;
}

const BALL_SIZE = 44;
/** The track's equal end padding — must agree with the ball's `left-1`. */
const TRACK_INSET = 4;
/** Both page gutters — must agree with the sheet's `px-gutter` (16 a side). */
const PAGE_GUTTER = 32;
/** Release past this fraction of the travel counts as a confirm. */
const THRESHOLD = 0.8;

function fire(style: ImpactFeedbackStyle): void {
  // A haptic must never delay the interaction it accompanies, and a device
  // without a taptic engine rejects rather than throws.
  impactAsync(style).catch(() => {
    /* no haptics on this device */
  });
}

export function SwipeToConfirm({ label, onComplete }: SwipeToConfirmProps) {
  const { width: screen } = useWindowDimensions();
  // The track reports its own width; the explicit arithmetic (screen less
  // both gutters) keeps the control usable on the very first frame.
  const [trackWidth, setTrackWidth] = useState(0);
  const onTrackLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);
  const width = trackWidth > 0 ? trackWidth : screen - PAGE_GUTTER;
  const travel = Math.max(0, width - BALL_SIZE - TRACK_INSET * 2);

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
        // Horizontal intent belongs to this control; vertical belongs to the
        // scroll view above it.
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 6 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          dragStart.current = travelled.current;
          fire(ImpactFeedbackStyle.Light);
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.min(
            Math.max(dragStart.current + gesture.dx, 0),
            travel
          );
          travelled.current = next;
          offset.setValue(next);
        },
        onPanResponderRelease: () => {
          if (travel > 0 && travelled.current >= travel * THRESHOLD) {
            fire(ImpactFeedbackStyle.Medium);
            Animated.spring(offset, {
              friction: 7,
              tension: 300,
              toValue: travel,
              useNativeDriver: false,
            }).start(() => {
              latestComplete.current();
              // A rejected submit stays on this screen: put the ball home so
              // the form can be corrected and swiped again.
              travelled.current = 0;
              Animated.spring(offset, {
                friction: 7,
                tension: 300,
                toValue: 0,
                useNativeDriver: false,
              }).start();
            });
            return;
          }
          Animated.spring(offset, {
            friction: 7,
            tension: 300,
            toValue: 0,
            useNativeDriver: false,
          }).start();
        },
        // The parent took the gesture mid-drag: put the ball home.
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
    [offset, travel]
  );

  // Glue the fill edge to the ball's left edge; clear of it at rest.
  const fillWidth = offset.interpolate({
    extrapolate: "clamp",
    inputRange: [0, 1, Math.max(travel, 2)],
    outputRange: [0, 1 + TRACK_INSET, TRACK_INSET + Math.max(travel, 2)],
  });

  return (
    <View
      accessibilityActions={[{ label, name: "activate" }]}
      accessibilityHint="Drag the ball to the right to confirm"
      accessibilityLabel={label}
      accessibilityRole="button"
      className="h-touch w-full overflow-hidden rounded-button border border-border bg-card"
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "activate") {
          latestComplete.current();
        }
      }}
      onLayout={onTrackLayout}
      {...pan.panHandlers}
    >
      {/* Resting label, on the white track. Covered by the fill as it grows. */}
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-center" tone="foreground" variant="buttonLg">
          {label}
        </Text>
      </View>

      <Animated.View
        className="absolute inset-y-0 left-0 overflow-hidden bg-primary"
        style={{ width: fillWidth }}
      >
        {/* Full-track width inside the clipping fill, so this label sits
            exactly over the resting one and is revealed by the same edge. */}
        <View className="h-full items-center justify-center" style={{ width }}>
          <Text
            className="text-center"
            tone="primary-foreground"
            variant="buttonLg"
          >
            {label}
          </Text>
        </View>
      </Animated.View>

      <Animated.View
        className="absolute top-1 left-1"
        style={{
          height: BALL_SIZE,
          transform: [{ translateX: offset }],
          width: BALL_SIZE,
          zIndex: 2,
        }}
      >
        <View className="size-full flex-row items-center justify-center rounded-pill border-2 border-card bg-primary">
          <Icon name="chevron-right" size="sm" tone="primary-foreground" />
          <Icon name="chevron-right" size="sm" tone="primary-foreground" />
        </View>
      </Animated.View>
    </View>
  );
}
