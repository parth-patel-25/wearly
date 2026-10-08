import { SPRING } from "@wearly/design-tokens/motion";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "./icon";
import { Text } from "./text";

/**
 * Bottom sheet.
 *
 * Filters and short choices belong in a sheet, not in a settings screen. The
 * design system gives sheets the largest radius in the product and a scrim soft
 * enough that the sheet still reads as the focus.
 *
 * The scrim and the panel are positioned rather than laid out. This is the one
 * overlay primitive in the product, and an overlay is not layout — every screen
 * underneath it stays flexbox.
 *
 * Dismissal is a drag on the top chrome (handle + title row): the panel
 * follows the finger down and lets go past the threshold, or springs home.
 * The scroll content keeps its own gesture — only the non-scrolling chrome
 * drags, so a scroll can never accidentally dismiss.
 */

/** Dragged this far down (px) on release, the sheet lets go. */
const CLOSE_DISTANCE = 120;
/** Flicked this fast downward (px/s), the sheet lets go whatever the distance. */
const CLOSE_VELOCITY = 900;

export interface BottomSheetProps {
  children: ReactNode;
  /** Sticky under the content. The "Apply · 3 selected" affordance lives here. */
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  title?: string;
}

export function BottomSheet({
  children,
  footer,
  onClose,
  open,
  title,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const dragY = useSharedValue(0);
  const shouldDismiss = useSharedValue(false);

  // The panel is remounted at rest every time the sheet opens — a release that
  // dismissed it must not leave it translated on the next open.
  useEffect(() => {
    if (open) {
      dragY.value = 0;
      shouldDismiss.value = false;
    }
  }, [dragY, open, shouldDismiss]);

  // Dismissal crosses the worklet boundary through a shared value, never
  // through a closure over a mutable ref: the gesture worklet only writes the
  // flag, and this reaction — re-registered whenever `onClose` changes — is
  // the only place that calls back into JS. Closing over a ref and mutating
  // `.current` from render trips the "modified an object already passed to a
  // worklet" fatal.
  useAnimatedReaction(
    () => shouldDismiss.value,
    (dismiss, previous) => {
      if (dismiss === true && previous !== true) {
        runOnJS(onClose)();
      }
    },
    [onClose]
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          dragY.value = Math.max(event.translationY, 0);
        })
        .onEnd((event) => {
          if (
            event.translationY > CLOSE_DISTANCE ||
            event.velocityY > CLOSE_VELOCITY
          ) {
            shouldDismiss.value = true;
            return;
          }
          dragY.value = reduceMotion === true ? 0 : withSpring(0, SPRING.press);
        }),
    [dragY, reduceMotion, shouldDismiss]
  );

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }));

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={open}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            className="absolute inset-0 bg-backdrop"
            onPress={onClose}
          />
          <Animated.View
            className="max-h-sheet rounded-t-sheet border-border border-t bg-card px-gutter"
            style={[{ paddingBottom: insets.bottom + 24 }, panelStyle]}
          >
            <GestureDetector gesture={pan}>
              <View>
                <View className="items-center pt-3 pb-2">
                  <View className="h-1.5 w-10 rounded-pill bg-border" />
                </View>

                {title ? (
                  <View className="flex-row items-center justify-between gap-3 pt-2 pb-2">
                    <Text className="flex-1" variant="headingMd">
                      {title}
                    </Text>
                    <Pressable
                      accessibilityLabel="Close"
                      accessibilityRole="button"
                      className="size-11 items-center justify-center rounded-pill bg-muted active:bg-accent"
                      hitSlop={8}
                      onPress={onClose}
                    >
                      <Icon name="close" size="sm" tone="foreground" />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </GestureDetector>

            <ScrollView
              className="flex flex-col"
              contentContainerClassName="flex flex-col gap-8 pb-4"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>

            {footer ? (
              <View className="flex flex-col gap-2 pt-2">{footer}</View>
            ) : null}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
