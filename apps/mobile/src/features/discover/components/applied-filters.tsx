import { CONDITION_LABEL } from "@shared/data/catalogue";
import type { Filters } from "@shared/data/filters";
import { NO_FILTERS } from "@shared/data/filters";
import { Chip } from "@wearly/ui-native/badge";
import { View } from "react-native";

interface AppliedFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

/** What is currently narrowing the grid, each label removable in one tap. */
export function AppliedFilters({ filters, onChange }: AppliedFiltersProps) {
  const labels = [
    ...filters.categories,
    ...filters.sizes,
    ...filters.conditions.map((condition) => CONDITION_LABEL[condition]),
    ...(filters.maxDailyRate ? [`Up to ₹${filters.maxDailyRate}`] : []),
    ...(filters.from ? [`From ${filters.from}`] : []),
  ];

  if (labels.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      {labels.map((label) => (
        <Chip key={label} onPress={() => removeOne(filters, onChange, label)}>
          {`${label} ✕`}
        </Chip>
      ))}
      <Chip onPress={() => onChange(NO_FILTERS)}>Clear all</Chip>
    </View>
  );
}

function removeOne(
  filters: Filters,
  onChange: (next: Filters) => void,
  label: string
): void {
  const without = <T,>(list: readonly T[], value: T) =>
    list.filter((item) => item !== value);

  onChange({
    ...filters,
    categories: without(
      filters.categories,
      label as (typeof filters.categories)[number]
    ),
    conditions: without(
      filters.conditions,
      label as (typeof filters.conditions)[number]
    ),
    from: label.startsWith("From ") ? null : filters.from,
    maxDailyRate: label.startsWith("Up to") ? null : filters.maxDailyRate,
    sizes: without(filters.sizes, label),
  });
}
