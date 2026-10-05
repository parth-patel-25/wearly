import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
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
 */

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

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={open}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          className="absolute inset-0 bg-backdrop"
          onPress={onClose}
        />
        <View
          className="max-h-sheet rounded-sheet border-border border-t bg-card px-gutter"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
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
        </View>
      </View>
    </Modal>
  );
}
