import { CONDITION_LABEL } from "@shared/data/catalogue";
import type { Filters } from "@shared/data/filters";
import { NO_FILTERS } from "@shared/data/filters";
import { Chip } from "@wearly/ui-native/badge";
import { View } from "react-native";

interface AppliedFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

/** One removable chip. `key` is the state value it represents. */
interface Chip {
  kind: "category" | "condition" | "rate" | "size" | "from";
  key: string;
  label: string;
}

/** What is currently narrowing the grid, each label removable in one tap. */
export function AppliedFilters({ filters, onChange }: AppliedFiltersProps) {
  const chips: Chip[] = [];
  chips.push(
    ...filters.categories.map(
      (category): Chip => ({ key: category, kind: "category", label: category }),
    ),
    ...filters.sizes.map(
      (size): Chip => ({ key: size, kind: "size", label: size }),
    ),
    ...filters.conditions.map(
      (condition): Chip => ({
        key: condition,
        kind: "condition",
        label: CONDITION_LABEL[condition],
      }),
    ),
  );
  if (filters.maxDailyRate) {
    chips.push({
      key: "rate",
      kind: "rate",
      label: `Up to ₹${filters.maxDailyRate}`,
    });
  }
  if (filters.from) {
    chips.push({ key: "from", kind: "from", label: `From ${filters.from}` });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Chip
          key={`${chip.kind}-${chip.key}`}
          onPress={() => removeOne(filters, onChange, chip)}
        >
          {`${chip.label} ✕`}
        </Chip>
      ))}
      <Chip onPress={() => onChange(NO_FILTERS)}>Clear all</Chip>
    </View>
  );
}

function removeOne(
  filters: Filters,
  onChange: (next: Filters) => void,
  chip: Chip,
): void {
  const without = <T extends string>(list: readonly T[], value: string) =>
    list.filter((item) => item !== value);

  switch (chip.kind) {
    case "category":
      onChange({
        ...filters,
        categories: without(filters.categories, chip.key),
      });
      break;
    case "condition":
      onChange({
        ...filters,
        conditions: without(filters.conditions, chip.key),
      });
      break;
    case "size":
      onChange({ ...filters, sizes: without(filters.sizes, chip.key) });
      break;
    case "rate":
      onChange({ ...filters, maxDailyRate: null });
      break;
    case "from":
      onChange({ ...filters, from: null });
      break;
  }
}
