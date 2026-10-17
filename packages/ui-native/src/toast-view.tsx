import { Pressable, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "./icon";
import { Text } from "./text";
import type { ToastCloseHandle } from "./toast-motion";
import { useToastMotion } from "./toast-motion";

/**
 * The toast surface.
 *
 * The presentation only: which tone classes, which icon, how the disc and the
 * text sit on the card. Everything about movement and dismissal lives in
 * `toast-motion.ts`, so this file is just the thing you see.
 *
 * The surface is token-coloured and the message is a `*-foreground` pair, so it
 * stays legible in both themes without a single hex value. A `card` disc behind
 * the status glyph carries the tone by shape as well, never colour alone.
 */

export type ToastTone = "error" | "info" | "success";

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

const TONE = {
  error: {
    surface: "bg-destructive-background",
    text: "destructive-foreground",
  },
  info: { surface: "bg-info-background", text: "info-foreground" },
  success: { surface: "bg-success-background", text: "success-foreground" },
} as const;

const ICON = {
  error: "close",
  info: "sparkles",
  success: "check",
} as const;

interface ToastViewProps {
  closeRef: ToastCloseHandle;
  message: ToastMessage;
  onDismissed: () => void;
}

export function ToastView({ closeRef, message, onDismissed }: ToastViewProps) {
  const insets = useSafeAreaInsets();
  const { close, pan, surfaceStyle } = useToastMotion({
    closeRef,
    onDismissed,
  });
  const tone = TONE[message.tone];

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
            accessibilityLabel={message.text}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            className={`flex-row items-center gap-3 rounded-card border border-border px-4 py-3.5 shadow-float ${tone.surface}`}
            onPress={close}
          >
            <View className="size-9 items-center justify-center rounded-pill bg-card">
              <Icon name={ICON[message.tone]} size="sm" tone={tone.text} />
            </View>
            <Text className="flex-1" tone={tone.text} variant="bodySm">
              {message.text}
            </Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
