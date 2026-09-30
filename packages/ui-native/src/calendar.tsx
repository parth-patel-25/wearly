import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { DayCell, NavButton } from "./calendar-cell";
import { Text } from "./text";

/**
 * The rental calendar.
 *
 * Date range selection is a core Wearly interaction, not a form field, so this is
 * a purpose-built month grid rather than a platform picker. Three things it has
 * to do well: make the selected range obvious, make unavailable dates
 * unmistakable, and make the resulting duration and price unmissable.
 *
 * Unavailable days are struck through *and* marked with `accessibilityState`, so
 * they are not distinguished by colour alone.
 */

/** Monday-first. The key is the full name; only the initial is shown. */
const WEEKDAYS = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
] as const;

export interface CalendarRange {
  end: string | null;
  start: string | null;
}

export interface CalendarProps {
  /** ISO `YYYY-MM-DD` keys that cannot be selected. */
  blocked?: readonly string[];
  /** Minimum selectable day, ISO. Everything before it is disabled. */
  minDate?: string;
  onChange: (range: CalendarRange) => void;
  range: CalendarRange;
}

const toKey = (date: Date): string => date.toISOString().slice(0, 10);
const fromKey = (key: string): Date => new Date(`${key}T00:00:00`);

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function buildGrid(month: Date): (string | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  // Monday-first: getDay() is Sunday-zero, so shift it.
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  const cells: (string | null)[] = Array.from({ length: leading }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toKey(new Date(month.getFullYear(), month.getMonth(), day)));
  }

  return cells;
}

export function Calendar({
  blocked = [],
  minDate,
  onChange,
  range,
}: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const from = range.start ?? minDate;
    return from ? fromKey(from) : new Date();
  });

  const blockedSet = useMemo(() => new Set(blocked), [blocked]);
  const cells = useMemo(() => buildGrid(visibleMonth), [visibleMonth]);

  const pick = useCallback(
    (key: string) => {
      // A tap after a complete range starts a new one; a tap after only a start
      // completes the range. That is what people expect from a range picker and
      // it removes the "tap start again to reset" dance.
      onChange(
        range.start && !range.end
          ? { end: key, start: range.start }
          : { end: null, start: key }
      );
    },
    [onChange, range.end, range.start]
  );

  return (
    <View className="flex flex-col gap-4">
      <View className="flex-row items-center justify-between">
        <Text variant="headingSm">
          {visibleMonth.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </Text>
        <View className="flex-row gap-1">
          <NavButton
            icon="chevron-left"
            label="Previous month"
            onPress={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          />
          <NavButton
            icon="chevron-right"
            label="Next month"
            onPress={() => setVisibleMonth(addMonths(visibleMonth, 1))}
          />
        </View>
      </View>

      <View className="flex-row">
        {WEEKDAYS.map((day) => (
          <Text
            className="flex-1 text-center"
            key={day.key}
            tone="muted-foreground"
            variant="caption"
          >
            {day.label}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((key, index) => {
          if (key === null) {
            // biome-ignore lint/suspicious/noArrayIndexKey: positional placeholder
            return <View className="h-12 w-[14.28%]" key={`pad-${index}`} />;
          }
          return (
            <DayCell
              blocked={blockedSet.has(key)}
              isEnd={key === range.end}
              isPast={Boolean(minDate && key < minDate)}
              isStart={key === range.start}
              key={key}
              label={key}
              onPress={pick}
            />
          );
        })}
      </View>
    </View>
  );
}
