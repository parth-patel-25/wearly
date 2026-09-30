import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./text";
import type { Tone } from "./tone";

/**
 * Status and money.
 *
 * A rental's state is shown with a label *and* a colour, never colour alone — a
 * status nobody can read is not a status. And every amount the user might pay
 * goes through `PriceRow`, so the shape of a breakdown is identical everywhere:
 * item on the left, amount on the right, total emphasised.
 */

const STATUS = {
  active: { surface: "bg-success-background", tone: "success" },
  "awaiting-return": { surface: "bg-warning-background", tone: "warning" },
  completed: { surface: "bg-muted", tone: "muted-foreground" },
  deposit: { surface: "bg-info-background", tone: "info" },
  upcoming: { surface: "bg-accent", tone: "accent-foreground" },
} as const;

export type RentalStatus = keyof typeof STATUS;

const STATUS_LABEL: Record<RentalStatus, string> = {
  active: "With you",
  "awaiting-return": "Return due",
  completed: "Returned",
  deposit: "Refundable",
  upcoming: "Upcoming",
};

export interface StatusPillProps {
  status: RentalStatus;
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <View
      className={`flex-row items-center gap-2 self-start rounded-pill px-3 py-1 ${STATUS[status].surface}`}
    >
      <View className="size-1.5 rounded-pill bg-border" />
      <Text tone={STATUS[status].tone as Tone} variant="label">
        {STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

export interface PriceRowProps {
  /** Rendered in the muted tone, and not part of the total. */
  emphasis?: "muted" | "normal" | "total";
  hint?: string;
  label: string;
  value: string;
}

/** One line of a price breakdown. `emphasis="total"` is the only emphasised row. */
export function PriceRow({
  emphasis = "normal",
  hint,
  label,
  value,
}: PriceRowProps) {
  const isTotal = emphasis === "total";

  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1 flex-col gap-0.5">
        <Text
          tone={emphasis === "muted" ? "muted-foreground" : "foreground"}
          variant={isTotal ? "bodyLg" : "bodySm"}
        >
          {label}
        </Text>
        {hint ? (
          <Text tone="muted-foreground" variant="caption">
            {hint}
          </Text>
        ) : null}
      </View>
      <Text
        className={isTotal ? "font-medium text-native-body-lg" : ""}
        tone={emphasis === "muted" ? "muted-foreground" : "foreground"}
        variant={isTotal ? "price" : "bodySm"}
      >
        {value}
      </Text>
    </View>
  );
}

export interface KeyValueRowProps {
  children?: ReactNode;
  label: string;
  value: string;
}

/** A plain fact, for the progressive sections on the product page. */
export function KeyValueRow({ children, label, value }: KeyValueRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-4 py-1">
      <Text tone="muted-foreground" variant="bodySm">
        {label}
      </Text>
      {children ?? (
        <Text className="text-right" variant="bodySm">
          {value}
        </Text>
      )}
    </View>
  );
}
