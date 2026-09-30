import type { ReactElement } from "react";
import type { ListRenderItem } from "react-native";
import { FlatList } from "react-native";
import type { ProductCardFrame, ProductCardProps } from "./product-card";
import { ProductCard } from "./product-card";

/**
 * The product grid.
 *
 * `FlatList` rather than a `ScrollView` of mapped views: the catalogue is
 * expected to grow well past fifty pieces, and a grid that renders every cell up
 * front is how a marketplace app starts dropping frames. FlatList is React
 * Native's virtualised list, so this is the same call as virtualising a large
 * table on the web.
 *
 * Two columns, generous gap. The image does the selling, so the space around it
 * is not wasted.
 */

export type ProductGridItem = Omit<
  ProductCardProps,
  "isFavourite" | "onFavourite" | "onPress"
>;

export interface ProductGridProps {
  emptyState: ReactElement;
  favourites: ReadonlySet<string>;
  header?: ReactElement;
  items: readonly ProductGridItem[];
  onFavourite: (id: string) => void;
  onOpen: (id: string, frame: ProductCardFrame) => void;
}

export function ProductGrid({
  emptyState,
  favourites,
  header,
  items,
  onFavourite,
  onOpen,
}: ProductGridProps) {
  const renderItem: ListRenderItem<ProductGridItem> = ({ item }) => (
    <ProductCard
      {...item}
      isFavourite={favourites.has(item.id)}
      onFavourite={() => onFavourite(item.id)}
      onPress={(frame) => onOpen(item.id, frame)}
    />
  );

  return (
    <FlatList
      columnWrapperClassName="gap-4"
      contentContainerClassName="flex flex-col gap-6 px-page-inline pb-10"
      data={items}
      initialNumToRender={6}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={emptyState}
      ListHeaderComponent={header}
      maxToRenderPerBatch={6}
      numColumns={2}
      removeClippedSubviews
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      windowSize={5}
    />
  );
}
