import type { TextProps as RNTextProps } from "react-native";
import { Text as RNText } from "react-native";
import type { Tone } from "./tone";
import { toneClassName } from "./tone";

/**
 * The type scale, as semantic names.
 *
 * Headings carry `font-medium` rather than `font-bold` because Satoshi has no
 * 600 weight, and 500 at display sizes reads editorial instead of shouty. The
 * scale is deliberately small: a component that needs a new size needs a new
 * token, not a new variant here.
 */
const VARIANT = {
  bodyLg: "text-native-body-lg font-normal",
  bodyMd: "text-native-body-md font-normal",
  bodySm: "text-native-body-sm font-normal",
  caption: "text-native-caption font-normal",
  display: "text-native-display font-medium tracking-tight",
  headingLg: "text-native-heading-lg font-medium tracking-tight",
  headingMd: "text-native-heading-md font-medium tracking-tight",
  headingSm: "text-native-heading-sm font-medium tracking-tight",
  headingXl: "text-native-heading-xl font-medium tracking-tight",
  label: "text-native-label font-medium",
  price: "text-native-body-lg font-medium",
} as const;

export type TextVariant = keyof typeof VARIANT;

export interface TextProps extends RNTextProps {
  className?: string;
  tone?: Tone;
  variant?: TextVariant;
}

/**
 * Text at a named step of the Wearly scale.
 *
 * `tone` exists so colour stays a semantic choice at the call site
 * (`tone="muted-foreground"`) rather than a class string repeated across every
 * screen. Pass `className` only for layout — never to set a size or colour.
 */
export function Text({
  className,
  tone = "foreground",
  variant = "bodyMd",
  ...rest
}: TextProps) {
  const classes = [VARIANT[variant], toneClassName(tone), className]
    .filter(Boolean)
    .join(" ");

  return <RNText className={classes} {...rest} />;
}
