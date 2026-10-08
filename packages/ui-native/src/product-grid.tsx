import type { ListRenderItem } from "@shopify/flash-list";
import type { ReactElement } from "react";
import { View } from "react-native";
import { AppList } from "./app-list";
import type { ProductCardFrame, ProductCardProps } from "./product-card";
import { ProductCard } from "./product-card";

/**
 * The product grid.
 *
 * `AppList` (FlashList) rather than a `ScrollView` of mapped views: the
 * catalogue is expected to grow well past fifty pieces, and a grid that
 * renders every cell up front is how a marketplace app starts dropping
 * frames. FlashList recycles views and lays out without measuring each cell,
 * so this is the same call as virtualising a large table on the web.
 *
 * Two columns, generous gap. The image does the selling, so the space around it
 * is not wasted.
 */

export type ProductGridItem = Omit<
  ProductCardProps,
  "isFavourite" | "onFavourite" | "onPress"
>;

export interface ProductGridProps {
  className?: string;
  emptyState: ReactElement;
  favourites: ReadonlySet<string>;
  header?: ReactElement;
  items: readonly ProductGridItem[];
  onFavourite: (id: string) => void;
  onOpen: (id: string, frame: ProductCardFrame) => void;
}

export function ProductGrid({
  className = "flex-1 px-gutter",
  emptyState,
  favourites,
  header,
  items,
  onFavourite,
  onOpen,
}: ProductGridProps) {
  const renderItem: ListRenderItem<ProductGridItem> = ({ index, item }) => (
    <View className={index % 2 === 0 ? "w-full pr-2 pb-6" : "w-full pb-6 pl-2"}>
      <ProductCard
        {...item}
        isFavourite={favourites.has(item.id)}
        onFavourite={() => onFavourite(item.id)}
        onPress={(frame) => onOpen(item.id, frame)}
      />
    </View>
  );

  return (
    <AppList
      className={className}
      data={items}
      emptyState={emptyState}
      footer={<View className="h-10" />}
      header={header}
      keyExtractor={(item) => item.id}
      numColumns={2}
      renderItem={renderItem}
      showsScrollIndicator={false}
    />
  );
}
