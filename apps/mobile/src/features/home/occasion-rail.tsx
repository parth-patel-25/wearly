import { SectionHeader } from "@wearly/ui-native/display";
import { ProductCard } from "@wearly/ui-native/product-card";
import type { ProductGridItem } from "@wearly/ui-native/product-grid";
import type { ListRenderItem } from "react-native";
import { FlatList, View } from "react-native";

/**
 * The occasion rail.
 *
 * A vertical grid forces a decision per row: you see two pieces and then you are
 * looking at a wall. A rail says "there is more this way" without asking for a
 * commitment, and it keeps the opening of the screen to one story instead of
 * twelve thumbnails.
 *
 * The rail is horizontal inside the vertical grid, so the two never scroll
 * together and there is no nested same-orientation list. The peek is deliberate —
 * a rail showing exactly one card at a time is a carousel, and a carousel hides
 * the fact that there is a choice to make.
 */

/** Wide enough for a name on one line and half of the next card showing. */
const RAIL_CARD = "w-48";

export interface OccasionRailProps {
  favourites: ReadonlySet<string>;
  items: readonly ProductGridItem[];
  onFavourite: (id: string) => void;
  onOpen: (id: string) => void;
}

export function OccasionRail({
  favourites,
  items,
  onFavourite,
  onOpen,
}: OccasionRailProps) {
  const renderItem: ListRenderItem<ProductGridItem> = ({ item }) => (
    <View className={RAIL_CARD}>
      <ProductCard
        {...item}
        isFavourite={favourites.has(item.id)}
        onFavourite={() => onFavourite(item.id)}
        onPress={() => onOpen(item.id)}
      />
    </View>
  );

  return (
    <View className="gap-4">
      <SectionHeader caption="Four days, worn properly" title="On the rail" />

      <FlatList
        contentContainerClassName="gap-4"
        data={items}
        horizontal
        initialNumToRender={4}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
