import type { Category, Condition } from "@shared/data/catalogue";
import {
  CATEGORIES,
  CONDITION_LABEL,
  SIZE_FILTERS,
} from "@shared/data/catalogue";
import type { Filters } from "@shared/data/filters";
import { CONDITION_OPTIONS, NO_FILTERS, toggleIn } from "@shared/data/filters";
import { Chip } from "@wearly/ui-native/badge";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import type { CalendarRange } from "@wearly/ui-native/calendar";
import { Calendar } from "@wearly/ui-native/calendar";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

/**
 * The filter sheet.
 *
 * Filters live in a sheet, never in a settings screen. Each group is a row of
 * large chips rather than a checkbox list, because on a phone the fastest way to
 * narrow a catalogue is to tap four things in a row and see what is left.
 *
 * Nothing applies until the button is pressed, and the button says how many
 * results it will show. A filter that changes the grid silently is the most
 * frustrating thing a catalogue can do.
 */

const RATE_CEILINGS = [300, 500, 700, 900];

export interface FilterSheetProps {
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
  open: boolean;
  resultCount: number;
}

export function FilterSheet({
  filters,
  onApply,
  onClose,
  open,
  resultCount,
}: FilterSheetProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <BottomSheet
      footer={
        <View className="gap-3">
          <Button onPress={onClose} size="lg">
            {`Show ${resultCount} ${resultCount === 1 ? "piece" : "pieces"}`}
          </Button>
          <Button onPress={() => onApply(NO_FILTERS)} size="sm" variant="ghost">
            Clear all
          </Button>
        </View>
      }
      onClose={onClose}
      open={open}
      title="Filters"
    >
      <FilterGroup
        onPick={(option) =>
          onApply({
            ...filters,
            categories: toggleIn<Category>(
              filters.categories,
              option as Category
            ),
          })
        }
        options={CATEGORIES}
        selected={filters.categories}
        title="Category"
      />

      <FilterGroup
        onPick={(option) =>
          onApply({ ...filters, sizes: toggleIn(filters.sizes, option) })
        }
        options={SIZE_FILTERS}
        selected={filters.sizes}
        title="Size"
      />

      <FilterGroup
        labels={CONDITION_OPTIONS.map(
          (condition) => CONDITION_LABEL[condition]
        )}
        onPick={(option) =>
          onApply({
            ...filters,
            conditions: toggleIn<Condition>(
              filters.conditions,
              option as Condition
            ),
          })
        }
        options={CONDITION_OPTIONS}
        selected={filters.conditions}
        title="Condition"
      />

      <FilterGroup
        labels={RATE_CEILINGS.map((rate) => `₹${rate}`)}
        onPick={(option) => {
          const rate = Number(option);
          onApply({
            ...filters,
            maxDailyRate: filters.maxDailyRate === rate ? null : rate,
          });
        }}
        options={RATE_CEILINGS.map(String)}
        selected={
          filters.maxDailyRate === null ? [] : [String(filters.maxDailyRate)]
        }
        title="Up to per day"
      />

      <View className="gap-4">
        <Text variant="headingSm">Available from</Text>
        <Calendar
          minDate={today}
          onChange={(range: CalendarRange) =>
            onApply({ ...filters, from: range.start })
          }
          range={{ end: null, start: filters.from }}
        />
      </View>
    </BottomSheet>
  );
}

interface FilterGroupProps {
  labels?: readonly string[];
  onPick: (option: string) => void;
  options: readonly string[];
  selected: readonly string[];
  title: string;
}

function FilterGroup({
  labels,
  onPick,
  options,
  selected,
  title,
}: FilterGroupProps) {
  return (
    <View className="gap-4">
      <Text variant="headingSm">{title}</Text>
      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => (
          <Chip
            key={option}
            onPress={() => onPick(option)}
            selected={selected.includes(option)}
          >
            {labels?.[options.indexOf(option)] ?? option}
          </Chip>
        ))}
      </View>
    </View>
  );
}
