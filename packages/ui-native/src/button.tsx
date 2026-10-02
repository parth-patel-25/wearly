import type { ReactNode } from "react";
import type { PressableProps } from "react-native";
import { CONTROL_PRIMARY } from "./control-tokens";
import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { AnimatedPressable, usePressScale } from "./motion";
import type { TextVariant } from "./text";
import { Text } from "./text";
import type { Tone } from "./tone";

/**
 * Buttons.
 *
 * Heights come from the control tokens rather than Tailwind's scale, because
 * touch target size is an accessibility requirement, not a design preference:
 * 44px is the WCAG 2.2 minimum, and a primary mobile action gets 52px.
 *
 * The design system says controls animate colour only, so a press never shifts
 * the layout around it. The scale below is the one exception, and it stays
 * inside the control's own bounds.
 *
 * Labels are centred twice over: `justify-center` on the row places the text
 * element, and `text-center` on the text centres the *lines inside it*. The
 * second one only matters when a label wraps, but that is exactly when it is
 * needed — a wrapped element fills the row and its lines would otherwise hang
 * off the left. Keep labels to one line where you can: `w-full` plus three
 * layers of padding leaves a button roughly 96px narrower than its container.
 */

const BASE = "flex-row items-center justify-center gap-2 rounded-button";
const PRESS_DISABLED = "opacity-50";

const VARIANT = {
  destructive: "bg-destructive active:bg-destructive/85",
  ghost: "bg-transparent active:bg-accent",
  outline: "border border-border bg-card active:bg-muted",
  primary: `${CONTROL_PRIMARY.surface} ${CONTROL_PRIMARY.pressed}`,
  secondary: "bg-secondary active:bg-secondary/70",
  soft: "bg-accent active:bg-accent/70",
} as const;

const VARIANT_TONE = {
  destructive: "primary-foreground",
  ghost: "foreground",
  outline: "foreground",
  primary: CONTROL_PRIMARY.tone,
  secondary: "secondary-foreground",
  soft: "accent-foreground",
} as const;

const SIZE = {
  lg: { container: "h-touch", padding: "px-6", text: "bodyLg" },
  md: { container: "h-control", padding: "px-page-inline", text: "bodyMd" },
  sm: { container: "h-9", padding: "px-4", text: "bodySm" },
} as const;

export type ButtonVariant = keyof typeof VARIANT;
export type ButtonSize = keyof typeof SIZE;

export interface ButtonProps
  extends Omit<PressableProps, "children" | "style"> {
  children: ReactNode;
  disabled?: boolean;
  /** An icon before the label. Decorative — the label carries the meaning. */
  icon?: IconName;
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

/** A single, obvious action. */
export function Button({
  children,
  disabled = false,
  icon,
  loading = false,
  size = "md",
  variant = "primary",
  ...rest
}: ButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();
  const isInactive = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isInactive }}
      className={[
        BASE,
        VARIANT[variant],
        SIZE[size].container,
        SIZE[size].padding,
        "w-full",
        isInactive ? PRESS_DISABLED : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isInactive}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
      {...rest}
    >
      {icon ? (
        <Icon
          name={icon}
          size={size === "sm" ? "sm" : "md"}
          tone={VARIANT_TONE[variant]}
        />
      ) : null}
      <Text
        className="text-center"
        tone={VARIANT_TONE[variant]}
        variant={SIZE[size].text as TextVariant}
      >
        {children}
      </Text>
    </AnimatedPressable>
  );
}

export interface IconButtonProps
  extends Omit<PressableProps, "children" | "style"> {
  /** Required. An icon button with no label is unusable with a screen reader. */
  accessibilityLabel: string;
  icon: IconName;
  pressedScale?: number;
  size?: ButtonSize;
  tone?: Tone;
  variant?: ButtonVariant;
}

/** A square, icon-only control. Never smaller than 44px. */
export function IconButton({
  accessibilityLabel,
  disabled = false,
  icon,
  pressedScale = 0.94,
  size = "md",
  tone = "foreground",
  variant = "ghost",
  ...rest
}: IconButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(pressedScale);

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true }}
      className={[
        BASE,
        VARIANT[variant],
        size === "sm" ? "size-11" : "size-12",
        "px-0",
        disabled ? PRESS_DISABLED : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
      {...rest}
    >
      <Icon accessibilityLabel={accessibilityLabel} name={icon} tone={tone} />
    </AnimatedPressable>
  );
}
