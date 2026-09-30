import type { ReactNode } from "react";
import { View } from "react-native";

import { Icon } from "./icon";
import type { IconName } from "./icon-glyphs";
import { Text } from "./text";

/**
 * Small display components: progress, empty states, section headers, status
 * pills and price rows.
 *
 * They live together because they are all one-off-looking pieces of chrome that
 * would otherwise each get their own file and each invent a padding value.
 */

export interface ProgressBarProps {
  label?: string;
  /** 0–100. */
  value: number;
}

/** Profile-completion progress. Always shows its number — progress you cannot see is not progress. */
export function ProgressBar({ label, value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <View
      accessibilityLabel={label ?? `${clamped}% complete`}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: clamped }}
      className="w-full gap-2"
    >
      {label ? (
        <View className="flex-row items-center justify-between">
          <Text tone="muted-foreground" variant="caption">
            {label}
          </Text>
          <Text tone="primary" variant="caption">
            {clamped}%
          </Text>
        </View>
      ) : null}
      <View className="h-2 w-full overflow-hidden rounded-pill bg-muted">
        <View
          className="h-full rounded-pill bg-primary"
          style={{ width: `${clamped}%` }}
        />
      </View>
    </View>
  );
}

export interface EmptyStateProps {
  action?: ReactNode;
  body: string;
  icon: IconName;
  title: string;
}

/**
 * A designed nothing, never a blank screen. The copy is the point: "your
 * wardrobe adventures start here" invites, where "No data" reports.
 */
export function EmptyState({ action, body, icon, title }: EmptyStateProps) {
  return (
    <View className="flex flex-col items-center gap-4 rounded-card border border-border bg-card px-6 py-12">
      <View className="size-16 items-center justify-center rounded-pill bg-accent">
        <Icon name={icon} size="lg" tone="accent-foreground" />
      </View>
      <View className="items-center gap-2">
        <Text className="text-center" variant="headingSm">
          {title}
        </Text>
        <Text className="text-center" tone="muted-foreground" variant="bodySm">
          {body}
        </Text>
      </View>
      {action}
    </View>
  );
}

export interface SectionHeaderProps {
  action?: ReactNode;
  caption?: string;
  title: string;
}

/** The heading of a section on a scrolling screen, with an optional right-hand action. */
export function SectionHeader({ action, caption, title }: SectionHeaderProps) {
  return (
    <View className="flex-row items-end justify-between gap-3">
      <View className="flex-1 flex-col gap-1">
        <Text variant="headingMd">{title}</Text>
        {caption ? (
          <Text tone="muted-foreground" variant="caption">
            {caption}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
