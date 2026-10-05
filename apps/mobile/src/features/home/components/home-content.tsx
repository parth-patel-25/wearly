import { useSession } from "@core/providers/session-provider";
import type { ProductGridItem } from "@wearly/ui-native/product-grid";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { heroPiece, homeLooks } from "../home-data";
import { CategoryRail } from "./category-rail";
import { EditorialHero } from "./editorial-hero";
import { HomeHeader } from "./home-header";
import { HomeSearch } from "./home-search";
import { LooksRail } from "./looks-rail";
import { OccasionChipRail } from "./occasion-chip-rail";
import { ProductRail } from "./product-rail";

/**
 * Home — the magazine marketplace content.
 *
 * Rhythm: INSPIRE (hero) → EXPLORE (categories) → IDENTIFY NEED (occasions) →
 * DISCOVER (trending) → RETURN (new) → GET INSPIRED (looks). Rails run
 * horizontally inside the vertical grid that owns the scroll — one
 * orientation down, the other across, never fighting for a gesture.
 *
 * Honest-metadata rule (spec §7.8): no fabricated rental counts or ratings.
 * Trending carries the lender neighbourhood, New carries "Just added" — both
 * true of the prototype catalogue, which the screen footer labels as invented.
 */

interface HomeContentProps {
  favourites: ReadonlySet<string>;
  fresh: readonly ProductGridItem[];
  onExploreHero: () => void;
  onFavourite: (id: string) => void;
  onFilters: () => void;
  onOpen: (id: string) => void;
  onSearch: () => void;
  onSeeAll: () => void;
  trending: readonly ProductGridItem[];
}

export function HomeContent({
  favourites,
  fresh,
  onExploreHero,
  onFavourite,
  onFilters,
  onOpen,
  onSearch,
  onSeeAll,
  trending,
}: HomeContentProps) {
  const { state } = useSession();
  const [category, setCategory] = useState<string>("✨ For You");
  const hero = useMemo(() => heroPiece(), []);
  const looks = useMemo(() => homeLooks(), []);

  return (
    <View className="gap-10 pb-2">
      <HomeHeader
        name={state.name ?? "Romina"}
        onNotifications={() => undefined}
        onProfile={() => undefined}
      />
      <HomeSearch onFilters={onFilters} onPress={onSearch} />
      <EditorialHero onExplore={onExploreHero} piece={hero} />
      <CategoryRail
        onSeeAll={onSeeAll}
        onSelect={setCategory}
        selected={category}
      />
      <OccasionChipRail onSelect={() => onSeeAll()} />
      <ProductRail
        caption="Pieces people keep opening"
        favourites={favourites}
        items={trending}
        onFavourite={onFavourite}
        onOpen={onOpen}
        onSeeAll={onSeeAll}
        title="Trending now"
      />
      <ProductRail
        caption="Fresh pieces added today"
        favourites={favourites}
        items={fresh}
        onFavourite={onFavourite}
        onOpen={onOpen}
        onSeeAll={onSeeAll}
        title="✨ New on Wearly"
      />
      <LooksRail looks={looks} onOpenLook={onOpen} />
    </View>
  );
}
