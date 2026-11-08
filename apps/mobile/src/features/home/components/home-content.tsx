import type { ProductGridItem } from "@wearly/ui-native/product-grid";
import type { Piece } from "@shared/data/catalogue";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { homeLooks } from "../home-data";
import { CategoryRail } from "./category-rail";
import { EditorialHero } from "./editorial-hero";
import { LooksRail } from "./looks-rail";
import { OccasionChipRail } from "./occasion-chip-rail";
import { ProductRail } from "./product-rail";

/**
 * Home — the magazine marketplace content.
 *
 * Lives inside the white sheet (which owns the surface and the rounded top
 * corners), so this is a plain section stack: everything keeps its existing
 * order and rhythm. The greeting lives in `HomeIntroCard` and the search strip
 * stays pinned above the sheet — neither belongs to the scroll-away content.
 *
 * Rhythm: INSPIRE (hero) → EXPLORE (categories) → IDENTIFY NEED (occasions) →
 * DISCOVER (trending) → RETURN (new) → GET INSPIRED (looks). Rails run
 * horizontally inside the vertical scroll that owns the gesture — one
 * orientation down, the other across, never fighting for a gesture.
 *
 * Honest-metadata rule (spec §7.8): no fabricated rental counts or ratings.
 * Trending carries the lender neighbourhood, New carries "Just added" — both
 * true of the live catalogue served by the public API.
 */

interface HomeContentProps {
  favourites: ReadonlySet<string>;
  fresh: readonly ProductGridItem[];
  onExploreHero: () => void;
  onFavourite: (id: string) => void;
  onOpen: (id: string) => void;
  onSeeAll: () => void;
  pieces: readonly Piece[];
  trending: readonly ProductGridItem[];
}

export function HomeContent({
  favourites,
  fresh,
  onExploreHero,
  onFavourite,
  onOpen,
  onSeeAll,
  pieces,
  trending,
}: HomeContentProps) {
  const [category, setCategory] = useState<string>("✨ For You");
  const hero = useMemo(() => pieces[0], [pieces]);
  const looks = useMemo(() => homeLooks(pieces), [pieces]);

  return (
    <View className="gap-10">
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
