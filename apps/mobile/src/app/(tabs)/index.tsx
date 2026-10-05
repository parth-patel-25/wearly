import { ROUTES } from "@core/routing/routes";
import { HomeContent } from "@features/home/components/home-content";
import { HomeIntroCard } from "@features/home/components/home-intro-card";
import { HomeSearch } from "@features/home/components/home-search";
import { RecommendedGrid } from "@features/home/components/recommended-grid";
import {
  CATALOGUE,
  CATALOGUE_DISCLAIMER,
  rentalSummary,
} from "@shared/data/catalogue";
import { useCatalogueGrid } from "@shared/hooks/use-catalogue-grid";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";

/**
 * Home — the magazine marketplace.
 *
 * Two full-bleed white cards separated by a `bg-muted` gap: the header card
 * on top (greeting + search, rounded on the bottom corners only) and the
 * content sheet below (rounded on the top corners only). The greeting scrolls
 * away; the search strip is the `ScrollView`'s sticky child (index 1) and
 * stays pinned — at rest the two white blocks read as one header card.
 * Everything inside the sheet keeps its existing order: hero → categories →
 * occasions → trending / new / looks, then the recommended grid.
 *
 * One vertical scroller owns the gesture. The rails inside are horizontal, and
 * the six-piece recommended grid is plain flex pairs — far below the count
 * where a nested virtualised list would pay for itself. Search hands off to
 * Discover with a `q` param — Home never filters locally.
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
    <View className="flex-1 bg-muted">
      {/* Direct children must stay Views: stickyHeaderIndices counts them.
          No container gap — spacing lives on the sheet wrapper so the two
          white blocks stay flush at rest. */}
      <ScrollView
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <View>
          <HomeIntroCard
            onNotifications={() => undefined}
            onProfile={() => undefined}
          />
        </View>
        {/* The pinned strip: the white bottom half of the header card,
            rounded on the bottom corners only. `pt-4` stays constant in both
            resting and docked states so the sticky pin never re-lays-out
            mid-scroll. Solid `bg-card` so scrolled content slides
            underneath it. */}
        <View className="rounded-b-4xl bg-card px-gutter pt-4 pb-5">
          <HomeSearch onFilters={toDiscover} onPress={toDiscover} />
        </View>
        {/* The muted gap lives here: transparent `pt-3` over the page
            background, then the full-bleed white sheet with rounded top
            corners only — grey shows in the notches on both facing edges. */}
        <View className="pt-3">
          <View className="rounded-t-4xl bg-card">
            <View className="gap-10 p-5">
              <HomeContent
                favourites={favourites}
                fresh={fresh}
                onExploreHero={toDiscover}
                onFavourite={onFavourite}
                onOpen={open}
                onSeeAll={toDiscover}
                trending={trending}
              />
              <View className="gap-4">
                <RecommendedGrid
                  favourites={favourites}
                  items={recommended}
                  onFavourite={onFavourite}
                  onOpen={open}
                />
                <Text tone="muted-foreground" variant="caption">
                  {CATALOGUE_DISCLAIMER}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
