import type { ReactNode } from "react";
import { View } from "react-native";

import { AnimatedPressable, usePressScale } from "./motion";
import { Text } from "./text";

/**
 * Badges and chips — the two small pills, kept apart on purpose.
 *
 * A **badge** states something about the world: a condition, a status, a size. It
 * is not interactive. A **chip** is a choice: a filter, a category, an answer.
 * Merging them is how a product ends up with twelve competing pills on a card.
 */

const BADGE = {
  info: "bg-info-background",
  neutral: "bg-muted",
  primary: "bg-accent",
  success: "bg-success-background",
  warning: "bg-warning-background",
} as const;

const BADGE_TEXT = {
  info: "info-foreground",
  neutral: "muted-foreground",
  primary: "accent-foreground",
  success: "success-foreground",
  warning: "warning-foreground",
} as const;

export type BadgeVariant = keyof typeof BADGE;

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

/**
 * Status text. Always a `*-foreground` token on a `*-background` surface: the
 * mid status tone is for fills and icons, never for text.
 */
export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <View className={`self-start rounded-badge px-3 py-1 ${BADGE[variant]}`}>
      <Text tone={BADGE_TEXT[variant]} variant="label">
        {children}
      </Text>
    </View>
  );
}

export interface ChipProps {
  /** Only needed when the visible label is not the whole meaning. */
  accessibilityLabel?: string;
  children: ReactNode;
  icon?: ReactNode;
  onPress?: () => void;
  selected?: boolean;
}

/**
 * A selectable pill: categories, sizes, filters, and the personalisation
 * answers. The selected state is exposed to assistive technology rather than
 * being carried by colour alone.
 */
export function Chip({
  accessibilityLabel,
  children,
  icon,
  onPress,
  selected = false,
}: ChipProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.96);

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`min-h-11 flex-row items-center gap-2 self-start rounded-pill border px-4 ${selected ? "border-primary bg-primary" : "border-border bg-card active:bg-muted"}`}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
    >
      {icon}
      <Text
        tone={selected ? "primary-foreground" : "foreground"}
        variant="label"
      >
        {children}
      </Text>
    </AnimatedPressable>
  );
}
