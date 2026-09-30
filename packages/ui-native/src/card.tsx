import type { ReactNode } from "react";
import type { ViewProps } from "react-native";
import { View } from "react-native";

import { Text } from "./text";
import type { Tone } from "./tone";

/**
 * Surfaces.
 *
 * Elevation in Wearly is barely there on purpose: separation comes from a border
 * and a tonal step, and a shadow is reserved for things that genuinely float.
 * If a card needs a strong shadow to be readable, the problem is the border or
 * the surface contrast — not the shadow.
 */

const VARIANT = {
  /** A hero or promotional block. The strongest surface in the product. */
  brand: "bg-brand",
  /** The everyday raised surface: a card on the warm background. */
  default: "bg-card border border-border",
  /** A quiet inset panel, for grouping facts inside a card. */
  muted: "bg-muted",
  /** A soft rose wash. Reads as a highlight without shouting. */
  soft: "bg-accent",
} as const;

export type CardVariant = keyof typeof VARIANT;

/** The readable foreground for each card variant, for text placed on top of it. */
export const CARD_TONE = {
  brand: "brand",
  default: "card-foreground",
  muted: "foreground",
  soft: "accent-foreground",
} as const satisfies Record<CardVariant, Tone>;

export interface CardProps extends ViewProps {
  tone?: Tone;
  variant?: CardVariant;
}

export function Card({
  children,
  className,
  tone,
  variant = "default",
  ...rest
}: CardProps) {
  return (
    <View
      className={["rounded-card", VARIANT[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </View>
  );
}

export interface CardTitleProps {
  children: ReactNode;
  className?: string;
  tone?: Tone;
}

/** The heading of a card or a progressive section. */
export function CardTitle({
  children,
  className,
  tone = "foreground",
}: CardTitleProps) {
  return (
    <Text className={className} tone={tone} variant="headingSm">
      {children}
    </Text>
  );
}

export interface PanelProps extends ViewProps {
  subtitle?: string;
  title: string;
  tone?: Tone;
}

/** A titled block with an optional supporting line. Product page sections. */
export function Panel({
  children,
  className,
  subtitle,
  title,
  tone = "foreground",
  ...rest
}: PanelProps) {
  return (
    <View
      className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <View className="flex flex-col gap-1">
        <CardTitle tone={tone}>{title}</CardTitle>
        {subtitle ? (
          <Text tone="muted-foreground" variant="caption">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}
