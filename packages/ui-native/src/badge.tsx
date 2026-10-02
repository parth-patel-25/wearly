import type { ReactNode } from "react";
import { View } from "react-native";

import { CONTROL_PRIMARY, CONTROL_SURFACE } from "./control-tokens";
import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { AnimatedPressable, usePressScale } from "./motion";
import { Text } from "./text";
import type { Tone } from "./tone";

/**
 * Badges and chips — the two small pills, kept apart on purpose.
 *
 * A **badge** states something about the world: a condition, a status, a size. It
 * is not interactive. A **chip** is a choice: a filter, a category, an answer.
 * Merging them is how a product ends up with twelve competing pills on a card.
 *
 * Chosen and important both resolve to the same brand rose as a primary button —
 * see `control-tokens`. `--wearly-accent` is the quiet wash, so it belongs to
 * nothing that claims to have been selected.
 */

const BADGE = {
  info: "bg-info-background",
  neutral: "bg-muted",
  primary: CONTROL_PRIMARY.surface,
  success: "bg-success-background",
  warning: "bg-warning-background",
} as const;

const BADGE_TEXT = {
  info: "info-foreground",
  neutral: "muted-foreground",
  primary: CONTROL_PRIMARY.tone,
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
 * mid status tone is for fills and icons, never for text. `primary` is the one
 * exception — it is a control fill, deepened so white text clears AA.
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
  /** An icon before the label. Tinted to the chip's own state tone. */
  icon?: IconName;
  onPress?: () => void;
  selected?: boolean;
}

const CHIP_STATE = {
  default: {
    className: `border-border ${CONTROL_SURFACE.surface} ${CONTROL_SURFACE.pressed}`,
    tone: CONTROL_SURFACE.tone,
  },
  selected: {
    className: `border-primary ${CONTROL_PRIMARY.surface} ${CONTROL_PRIMARY.pressed}`,
    tone: CONTROL_PRIMARY.tone,
  },
} as const satisfies Record<string, { className: string; tone: Tone }>;

/**
 * A selectable pill: categories, sizes, filters, and the personalisation
 * answers. Selected uses the same fill as a primary button, and the state is
 * exposed to assistive technology rather than being carried by colour alone.
 */
export function Chip({
  accessibilityLabel,
  children,
  icon,
  onPress,
  selected = false,
}: ChipProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.96);
  const state = selected ? CHIP_STATE.selected : CHIP_STATE.default;

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`min-h-11 flex-row items-center gap-2 self-start rounded-pill border px-4 ${state.className}`}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
    >
      {icon ? <Icon name={icon} size="sm" tone={state.tone} /> : null}
      <Text tone={state.tone} variant="label">
        {children}
      </Text>
    </AnimatedPressable>
  );
}
