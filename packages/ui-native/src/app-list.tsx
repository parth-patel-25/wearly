import type { FlashListProps, ListRenderItem } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";
import type { ReactElement } from "react";
import { RefreshControl } from "react-native";
import { withUniwind } from "uniwind";

/**
 * The shared virtualised list.
 *
 * A thin, generic wrapper over Shopify's `FlashList` (v2, New Architecture).
 * FlashList recycles views and lays out items without measuring every cell up
 * front, so it holds frame rate on long catalogues where `FlatList` starts
 * dropping frames. v2 sizes content automatically — there is intentionally no
 * `estimatedItemSize`, `windowSize` or batch-size tuning to fiddle with.
 *
 * Styling note: v2 positions items by layout-manager offsets and never reads
 * `contentContainerStyle`, so `contentContainerClassName` gap/padding is dead
 * here (it was the source of the vanishing card gaps after migration). All
 * spacing therefore lives on the list root (`className`, e.g. `px-gutter`),
 * between rows (`separator`), or inside each row (`renderItem` wrappers).
 *
 * `withUniwind` teaches the native list the `className` dialect. The `as`
 * cast below re-attaches the generic the HOC erases; without it every list
 * would degrade to `any` items.
 *
 * Deliberately narrow props: data in, rows out. The caller owns `renderItem`
 * (and therefore the row's state, favourites, navigation) — this component
 * owns scrolling, recycling and the empty/loading chrome. Nothing feature
 * specific may leak in here.
 */

const StyledFlashList = withUniwind(FlashList) as unknown as <T>(
  props: FlashListProps<T> & {
    className?: string;
  }
) => ReactElement;

export interface AppListProps<T> {
  className?: string;
  data: readonly T[];
  emptyState?: ReactElement | null;
  footer?: ReactElement | null;
  getItemType?: (item: T, index: number) => string | number;
  header?: ReactElement | null;
  horizontal?: boolean;
  keyExtractor: (item: T, index: number) => string;
  numColumns?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  renderItem: ListRenderItem<T>;
  separator?: ReactElement | null;
  showsScrollIndicator?: boolean;
  testID?: string;
}

export function AppList<T>({
  className,
  data,
  emptyState,
  footer,
  getItemType,
  header,
  horizontal,
  keyExtractor,
  numColumns,
  onEndReached,
  onEndReachedThreshold,
  onRefresh,
  refreshing,
  renderItem,
  separator,
  showsScrollIndicator,
  testID,
}: AppListProps<T>) {
  return (
    <StyledFlashList
      className={className}
      data={data}
      getItemType={getItemType}
      horizontal={horizontal}
      ItemSeparatorComponent={separator ? () => separator : undefined}
      keyExtractor={keyExtractor}
      ListEmptyComponent={emptyState}
      ListFooterComponent={footer}
      ListHeaderComponent={header}
      numColumns={numColumns}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold ?? 0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing ?? false}
          />
        ) : undefined
      }
      renderItem={renderItem}
      showsHorizontalScrollIndicator={horizontal ? showsScrollIndicator : false}
      showsVerticalScrollIndicator={horizontal ? false : showsScrollIndicator}
      testID={testID}
    />
  );
}
