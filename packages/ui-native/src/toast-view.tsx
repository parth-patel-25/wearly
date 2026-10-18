import { Pressable, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { IconName } from "./icon";
import { Icon } from "./icon";
import { Text } from "./text";
import type { ToastCloseHandle } from "./toast-motion";
import { useToastMotion } from "./toast-motion";

/**
 * The toast surface.
 *
 * The presentation only: the pill, the leading rose disc, the glyph and the
 * message. Everything about movement and dismissal lives in `toast-motion.ts`,
 * so this file is just the thing you see.
 *
 * One surface serves all four tones. `bg-card` (white in light) carries the
 * design system's neutral hairline `border-border` and a soft `shadow-float`,
 * and a `bg-primary` disc with a white `primary-foreground` glyph — the brand
 * rose, no second palette. The border is the quiet neutral one, never the rose:
 * it edges the pill without pulling the eye off the message. The tone is told
 * apart by its **icon** and by the word prepended to the accessibility label,
 * never by colour alone, so it survives a colour-blind or screen-reader user.
 * The message is `bodyMd`/`font-medium` in `foreground` and wraps rather than
 * truncating: an error is never cut off to save a line.
 */

export type ToastTone = "error" | "info" | "success" | "warning";

export interface ToastMessage {
  /** Milliseconds before auto-dismiss. Ignored when `persistent` is true. */
  duration?: number;
  id: number;
  /** Hold until the user taps or swipes it away. */
  persistent?: boolean;
  text: string;
  tone: ToastTone;
}

const ICON = {
  error: "close",
  info: "info",
  success: "check",
  warning: "triangle-alert",
} as const satisfies Record<ToastTone, IconName>;

/** Read out with the message so the status is not carried by colour alone. */
const TONE_LABEL = {
  error: "Error",
  info: "Information",
  success: "Success",
  warning: "Warning",
} as const satisfies Record<ToastTone, string>;

const SURFACE =
  "flex-row items-center gap-3.5 rounded-pill border border-border bg-card py-3 pl-3 pr-6 shadow-float";

interface ToastViewProps {
  closeRef: ToastCloseHandle;
  message: ToastMessage;
  onDismissed: () => void;
}

export function ToastView({ closeRef, message, onDismissed }: ToastViewProps) {
  const insets = useSafeAreaInsets();
  const { close, pan, surfaceStyle } = useToastMotion({
    closeRef,
    duration: message.duration,
    onDismissed,
    persistent: message.persistent,
  });

  return (
    <View
      className="absolute inset-x-0 top-0 z-50 items-center px-gutter"
      pointerEvents="box-none"
      style={{ paddingTop: insets.top + 12 }}
    >
      <GestureDetector gesture={pan}>
        <Animated.View className="w-full max-w-md" style={surfaceStyle}>
          <Pressable
            accessibilityHint="Dismisses this message"
            accessibilityLabel={`${TONE_LABEL[message.tone]}: ${message.text}`}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            className={SURFACE}
            onPress={close}
          >
            <View className="size-9 items-center justify-center rounded-pill bg-primary">
              <Icon
                name={ICON[message.tone]}
                size="sm"
                tone="primary-foreground"
              />
            </View>
            <Text
              className="flex-1 font-medium"
              tone="foreground"
              variant="bodyMd"
            >
              {message.text}
            </Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
