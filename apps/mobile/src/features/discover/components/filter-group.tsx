import type { Category, Condition } from "@shared/data/catalogue";
import type { Filters } from "@shared/data/filters";
import { toggleIn } from "@shared/data/filters";
import { Chip } from "@wearly/ui-native/badge";
import { Text } from "@wearly/ui-native/text";
import { memo } from "react";
import { View } from "react-native";

/** A `filters` updater — the unit of work groups report to `onApply`. */
export type Updater = (filters: Filters) => Filters;

/** Module-scope, so they are referentially stable across renders. */
export const toggleCategory = (option: string, filters: Filters): Filters => ({
  ...filters,
  categories: toggleIn<Category>(filters.categories, option as Category),
});
export const toggleCondition = (option: string, filters: Filters): Filters => ({
  ...filters,
  conditions: toggleIn<Condition>(filters.conditions, option as Condition),
});
export const toggleSize = (option: string, filters: Filters): Filters => ({
  ...filters,
  sizes: toggleIn(filters.sizes, option),
});

interface FilterGroupProps {
  labels?: readonly string[];
  onApply: (updater: Updater) => void;
  options: readonly string[];
  selected: readonly string[];
  title: string;
  toggle: (option: string, filters: Filters) => Filters;
}

/**
 * One row of filter chips. `memo` + module-scope `toggle` + caller-stable
 * `options`/`selected` mean tapping one chip re-renders only this group.
 */
export const FilterGroup = memo(function FilterGroup({
  labels,
  onApply,
  options,
  selected,
  title,
  toggle,
}: FilterGroupProps) {
  return (
    <View className="gap-4">
      <Text variant="headingSm">{title}</Text>
      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => (
          <Chip
            key={option}
            onPress={() => onApply((filters) => toggle(option, filters))}
            selected={selected.includes(option)}
          >
            {labels?.[options.indexOf(option)] ?? option}
          </Chip>
        ))}
      </View>
    </View>
  );
});
