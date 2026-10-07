import { EmptyState, SectionHeader } from "@wearly/ui-native/display";
import type { ProductCardFrame } from "@wearly/ui-native/product-card";
import { ProductCard } from "@wearly/ui-native/product-card";
import type { ProductGridItem } from "@wearly/ui-native/product-grid";
import { useMemo } from "react";
import { View } from "react-native";

/**
 * Recommended grid.
 *
 * A plain flex two-column layout, not a `FlatList`: Home only ever shows six
 * pieces here, well below the threshold where virtualisation pays for itself —
 * and a nested vertical `FlatList` inside the screen's `ScrollView` would fight
 * it for the gesture. Pairs of `flex-1` cells mirror the `ProductGrid` rhythm
 * (equal halves, `gap-4` columns, `gap-6` rows) without hardcoded widths.
 */

interface RecommendedGridProps {
  favourites: ReadonlySet<string>;
  items: readonly ProductGridItem[];
  onFavourite: (id: string) => void;
  onOpen: (id: string, frame?: ProductCardFrame) => void;
}

const PAIR = 2;

function toRows(items: readonly ProductGridItem[]): ProductGridItem[][] {
  const rows: ProductGridItem[][] = [];
  for (let index = 0; index < items.length; index += PAIR) {
    rows.push([...items.slice(index, index + PAIR)]);
  }
  return rows;
}

export function RecommendedGrid({
  favourites,
  items,
  onFavourite,
  onOpen,
}: RecommendedGridProps) {
  const rows = useMemo(() => toRows(items), [items]);

  if (items.length === 0) {
    return (
      <EmptyState
        body="The catalogue is empty right now. Check back soon."
        icon="shirt"
        title="Nothing to show yet"
      />
    );
  }

  return (
    <View className="gap-6">
      <SectionHeader
        caption="Chosen for you, refreshed often"
        title="Recommended for you"
      />
      <View className="gap-6">
        {rows.map((row, index) => (
          <View
            className="flex-row gap-4"
            // Rows are stable slices of a static six-piece list; the lead id is
            // enough to key them, with the index as the empty-row fallback.
            key={row[0]?.id ?? `row-${index}`}
          >
            {row.map((item) => (
              <View className="flex-1" key={item.id}>
                <ProductCard
                  {...item}
                  isFavourite={favourites.has(item.id)}
                  onFavourite={() => onFavourite(item.id)}
                  onPress={(frame) => onOpen(item.id, frame)}
                />
              </View>
            ))}
            {row.length < PAIR ? <View className="flex-1" /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
