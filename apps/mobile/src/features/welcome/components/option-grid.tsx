import { useMemo } from "react";
import { View } from "react-native";

import type { OptionIconName } from "./option-card";
import { OptionCard } from "./option-card";

export interface OptionGridProps<T extends string> {
  icons?: Partial<Record<T, OptionIconName>>;
  onSelect: (option: T) => void;
  options: readonly T[];
  selected: T | null;
}

const PAIR = 2;

function toRows<T>(options: readonly T[]): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < options.length; index += PAIR) {
    rows.push([...options.slice(index, index + PAIR)]);
  }
  return rows;
}

/**
 * Two-column arrangement of answers.
 *
 * Layout only — no selection state, no navigation. Pairs of `flex-1` cells keep
 * both columns equal on any width without hardcoded dimensions, mirroring the
 * Home recommended-grid rhythm.
 */
export function OptionGrid<T extends string>({
  icons,
  onSelect,
  options,
  selected,
}: OptionGridProps<T>) {
  const rows = useMemo(() => toRows(options), [options]);

  return (
    <View className="gap-3">
      {rows.map((row, index) => (
        <View className="flex-row gap-3" key={row[0] ?? `row-${index}`}>
          {row.map((option) => (
            <OptionCard
              icon={icons?.[option]}
              key={option}
              label={option}
              onPress={() => onSelect(option)}
              selected={selected === option}
            />
          ))}
          {row.length < PAIR ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
