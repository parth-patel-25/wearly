import { ROUTES } from "@core/routing/routes";
import { HomeContent } from "@features/home/components/home-content";
import {
  CATALOGUE,
  CATALOGUE_DISCLAIMER,
  rentalSummary,
} from "@shared/data/catalogue";
import { useCatalogueGrid } from "@shared/hooks/use-catalogue-grid";
import { EmptyState, SectionHeader } from "@wearly/ui-native/display";
import { ProductGrid } from "@wearly/ui-native/product-grid";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

/**
 * Home — the magazine marketplace.
 *
 * `ProductGrid`'s vertical list owns the scroll; the header stacks the
 * editorial rhythm (hero → categories → occasions → trending / new / looks)
 * above a 6-piece recommended grid. Search hands off to Discover with a `q`
 * param — Home never filters locally.
 */

const RAIL_COUNT = 8;
const GRID_COUNT = 6;

export default function HomeScreen() {
  const router = useRouter();
  const { favourites, items, onFavourite } = useCatalogueGrid();

  const trending = useMemo(
    () =>
      CATALOGUE.slice(0, RAIL_COUNT).map((piece, index) => ({
        fact: items[index]?.fact ?? piece.lender.neighbourhood,
        id: piece.id,
        name: piece.name,
        placeholderTone: piece.gallery[0],
        price: rentalSummary(piece, 2),
        src: piece.images[0],
      })),
    [items]
  );
  const fresh = useMemo(
    () =>
      CATALOGUE.slice(-RAIL_COUNT)
        .reverse()
        .map((piece) => ({
          fact: "Just added",
          id: piece.id,
          name: piece.name,
          placeholderTone: piece.gallery[0],
          price: rentalSummary(piece, 2),
          src: piece.images[0],
        })),
    []
  );
  const recommended = useMemo(() => items.slice(0, GRID_COUNT), [items]);
  const open = (id: string) => router.push(ROUTES.product(id));
  // Home search is an entry point: hand off to Discover focused, with no
  // local filtering. `q` (even empty) is the focus signal.
  const toDiscover = () =>
    router.navigate({ params: { q: "" }, pathname: ROUTES.discover });

  return (
    <View className="flex-1 bg-background">
      <ProductGrid
        emptyState={
          <EmptyState
            body="The catalogue is empty right now. Check back soon."
            icon="shirt"
            title="Nothing to show yet"
          />
        }
        favourites={favourites}
        header={
          <View className="gap-2">
            <HomeContent
              favourites={favourites}
              fresh={fresh}
              onExploreHero={toDiscover}
              onFavourite={onFavourite}
              onFilters={toDiscover}
              onOpen={open}
              onSearch={toDiscover}
              onSeeAll={toDiscover}
              trending={trending}
            />
            <View className="pt-6">
              <SectionHeader
                caption="Chosen for you, refreshed often"
                title="Recommended for you"
              />
            </View>
          </View>
        }
        items={recommended}
        onFavourite={onFavourite}
        onOpen={open}
      />
      <View className="px-gutter pb-8">
        <Text tone="muted-foreground" variant="caption">
          {CATALOGUE_DISCLAIMER}
        </Text>
      </View>
    </View>
  );
}
