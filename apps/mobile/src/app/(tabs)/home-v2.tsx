import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { EditorialMasthead } from "@features/home/editorial-masthead";
import { LeadStory, LenderNote } from "@features/home/lead-story";
import { OccasionRail } from "@features/home/occasion-rail";
import {
  CATALOGUE,
  CATALOGUE_DISCLAIMER,
  FEATURED,
} from "@shared/data/catalogue";
import { useCatalogueGrid } from "@shared/hooks/use-catalogue-grid";
import { Chip } from "@wearly/ui-native/badge";
import { EmptyState, SectionHeader } from "@wearly/ui-native/display";
import { ProductGrid } from "@wearly/ui-native/product-grid";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

/**
 * Home — the editorial issue.
 *
 * The other Home opens on a product card. This one opens on a story, and lets
 * the products arrive afterwards: a masthead, one lead piece written up as an
 * article, the person who lent it, a rail of more, and only then the grid.
 *
 * The bet is that a wardrobe rental app earns a return visit by having a point of
 * view, and that a grid of prices above the fold is the fastest way to have
 * none. So the price is demoted to a footnote, the product imagery is a portrait
 * rather than a shopfront, and nothing on the opening screen asks the user to
 * decide anything.
 *
 * It is a second route rather than a replacement so the two can be compared
 * honestly: `ROUTES.home` and `ROUTES.homeLegacy` are the same screen with the
 * names swapped, and the original at `/(tabs)` is still registered either way.
 * This screen shares the Home tab, so it never appears in the tab bar.
 *
 * Structure follows the one rule this screen has to respect: the vertical
 * `FlatList` inside `ProductGrid` owns the scroll, so every block above the grid
 * is a header and the rail inside it runs horizontally. One orientation down, the
 * other across, and no nested lists fighting for the same gesture.
 */

const MOODS = [
  "For a weekend",
  "Wedding season",
  "Everyday",
  "At work",
] as const;

const RAIL_COUNT = 6;
const GRID_COUNT = 6;

export default function HomeV2Screen() {
  const router = useRouter();
  const { state } = useSession();
  const { favourites, items, onFavourite } = useCatalogueGrid();

  const rail = useMemo(() => items.slice(1, 1 + RAIL_COUNT), [items]);
  const curated = useMemo(() => items.slice(0, GRID_COUNT), [items]);
  const firstName = state.name?.split(" ")[0];

  const open = (id: string) => router.push(ROUTES.product(id));

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
          <View className="gap-10 pb-2">
            <EditorialMasthead
              firstName={firstName}
              pieceCount={CATALOGUE.length}
            />

            <LeadStory onPress={() => open(FEATURED.id)} piece={FEATURED} />

            <OccasionRail
              favourites={favourites}
              items={rail}
              onFavourite={onFavourite}
              onOpen={open}
            />

            <LenderNote piece={FEATURED} />

            <View className="gap-4">
              <SectionHeader caption="A way in" title="Shop by mood" />
              <View className="flex-row flex-wrap gap-3">
                {MOODS.map((mood) => (
                  <Chip
                    key={mood}
                    onPress={() => router.navigate(ROUTES.discover)}
                  >
                    {mood}
                  </Chip>
                ))}
              </View>
            </View>

            <SectionHeader
              caption="Six pieces, chosen rather than scraped"
              title="The full edit"
            />
          </View>
        }
        items={curated}
        onFavourite={onFavourite}
        onOpen={open}
      />

      <View className="px-page-inline pb-8">
        <Text tone="muted-foreground" variant="caption">
          {CATALOGUE_DISCLAIMER}
        </Text>
      </View>
    </View>
  );
}
