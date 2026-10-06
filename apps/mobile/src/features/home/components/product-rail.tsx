import type { ListRenderItem } from "@shopify/flash-list";
import { AppList } from "@wearly/ui-native/app-list";
import { Chip } from "@wearly/ui-native/badge";
import { SectionHeader } from "@wearly/ui-native/display";
import { ProductCard } from "@wearly/ui-native/product-card";
import type { ProductGridItem } from "@wearly/ui-native/product-grid";
import { View } from "react-native";

/**
 * Horizontal product rail.
 *
 * Shared by Trending, New-on-Wearly and Recommended: image-first `ProductCard`
 * at a peek width so the rail reads as "more this way". The card owns its
 * favourite heart and hero measurement — this rail only owns the layout.
 */

interface ProductRailProps {
  caption?: string;
  favourites: ReadonlySet<string>;
  items: readonly ProductGridItem[];
  onFavourite: (id: string) => void;
  onOpen: (id: string) => void;
  onSeeAll: () => void;
  title: string;
}

const RAIL_CARD = "w-40";

export function ProductRail({
  caption,
  favourites,
  items,
  onFavourite,
  onOpen,
  onSeeAll,
  title,
}: ProductRailProps) {
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
      <SectionHeader
        action={
          <Chip onPress={onSeeAll} selected={false}>
            See all
          </Chip>
        }
        caption={caption}
        title={title}
      />
      <AppList
        data={items}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        separator={<View className="w-4" />}
        showsScrollIndicator={false}
      />
    </View>
  );
}
