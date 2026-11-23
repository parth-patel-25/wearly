import type { Updater } from "@features/discover/components/filter-group";
import {
  FilterGroup,
  toggleCategory,
  toggleCondition,
  toggleSize,
} from "@features/discover/components/filter-group";
import {
  CATEGORIES,
  CONDITION_LABEL,
  SIZE_FILTERS,
} from "@shared/data/catalogue";
import type { Filters } from "@shared/data/filters";
import { CONDITION_OPTIONS, NO_FILTERS } from "@shared/data/filters";
import { Chip } from "@wearly/ui-native/badge";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import type { CalendarRange } from "@wearly/ui-native/calendar";
import { Calendar } from "@wearly/ui-native/calendar";
import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { useState } from "react";
import { Pressable, View } from "react-native";

/**
 * The filter sheet.
 *
 * Filters live in a sheet, never in a settings screen. Each group is a row of
 * large chips rather than a checkbox list, because on a phone the fastest way
 * to narrow a catalogue is to tap four things in a row and see what is left.
 *
 * Nothing applies until the button is pressed, and the button says how many
 * results it will show. A filter that changes the grid silently is the most
 * frustrating thing a catalogue can do.
 *
 * Opening speed: the sheet starts with the calendar collapsed ("Available
 * from" expands it on tap), and each group is memoised with stable callbacks,
 * so tapping one chip re-renders only its own group rather than the sheet.
 */

const RATE_CEILINGS = [300, 500, 700, 900];

export interface FilterSheetProps {
  filters: Filters;
  /** True while the sheet is re-querying; the footer switches to "Updating…". */
  isUpdating: boolean;
  onApply: (updater: Updater) => void;
  onClose: () => void;
  open: boolean;
  resultCount: number;
}

export function FilterSheet({
  filters,
  isUpdating,
  onApply,
  onClose,
  open,
  resultCount,
}: FilterSheetProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [calendarExpanded, setCalendarExpanded] = useState(false);

  return (
    <BottomSheet
      footer={
        <View className="gap-3">
          <Button loading={isUpdating} onPress={onClose} size="lg">
            {isUpdating
              ? "Updating…"
              : `Show ${resultCount} ${resultCount === 1 ? "piece" : "pieces"}`}
          </Button>
          <Button
            onPress={() => onApply(() => NO_FILTERS)}
            size="sm"
            variant="ghost"
          >
            Clear all
          </Button>
        </View>
      }
      onClose={onClose}
      open={open}
      title="Filters"
    >
      <FilterGroup
        onApply={onApply}
        options={CATEGORIES}
        selected={filters.categories}
        title="Category"
        toggle={toggleCategory}
      />

      <FilterGroup
        onApply={onApply}
        options={SIZE_FILTERS}
        selected={filters.sizes}
        title="Size"
        toggle={toggleSize}
      />

      <FilterGroup
        labels={CONDITION_OPTIONS.map(
          (condition) => CONDITION_LABEL[condition]
        )}
        onApply={onApply}
        options={CONDITION_OPTIONS}
        selected={filters.conditions}
        title="Condition"
        toggle={toggleCondition}
      />

      <View className="gap-4">
        <Text variant="headingSm">Up to per day</Text>
        <View className="flex-row flex-wrap gap-3">
          {RATE_CEILINGS.map((rate) => (
            <Chip
              key={rate}
              onPress={() =>
                onApply((f) => ({
                  ...f,
                  maxDailyRate: f.maxDailyRate === rate ? null : rate,
                }))
              }
              selected={filters.maxDailyRate === rate}
            >
              {`₹${rate}`}
            </Chip>
          ))}
        </View>
      </View>

      <View className="gap-4">
        <Text variant="headingSm">Available from</Text>
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-between gap-2 rounded-card bg-card px-3 py-2.5"
          onPress={() => setCalendarExpanded(!calendarExpanded)}
        >
          <Text tone="foreground" variant="bodyMd">
            {filters.from ? `From ${filters.from}` : "Any date"}
          </Text>
          <Icon name="chevron-down" size="sm" tone="muted-foreground" />
        </Pressable>
        {calendarExpanded ? (
          <Calendar
            minDate={today}
            onChange={(range: CalendarRange) =>
              onApply((f) => ({ ...f, from: range.start }))
            }
            range={{ end: null, start: filters.from }}
          />
        ) : null}
      </View>
    </BottomSheet>
  );
}
