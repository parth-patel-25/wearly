import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { AppliedFilters } from "@features/discover/components/applied-filters";
import {
  DiscoverEmpty,
  headingFor,
  LocationSlot,
} from "@features/discover/components/discover-empty";
import { FilterSheet } from "@features/discover/components/filter-sheet";
import { useDiscoverListings } from "@features/discover/hooks/use-discover-listings";
import { useNearbyLocation } from "@features/discover/hooks/use-nearby-location";
import { CATEGORIES } from "@shared/data/catalogue";
import type { Filters } from "@shared/data/filters";
import { activeFilterCount, NO_FILTERS } from "@shared/data/filters";
import { listingToPiece } from "@shared/data/listing-to-piece";
import { useCatalogueGrid } from "@shared/hooks/use-catalogue-grid";
import { Chip } from "@wearly/ui-native/badge";
import { SectionHeader } from "@wearly/ui-native/display";
import { SearchField } from "@wearly/ui-native/fields";
import { Icon } from "@wearly/ui-native/icon";
import { ProductGrid } from "@wearly/ui-native/product-grid";
import { Text } from "@wearly/ui-native/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

/**
 * Discover.
 *
 * One request, one source of truth: the API ranks and filters, and the grid
 * renders exactly what it returns. Location is an opt-in card rather than a
 * prompt on mount, and a distance is never more than a rounded band.
 */
export default function DiscoverScreen() {
  const router = useRouter();
  const { state } = useSession();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const nearby = useNearbyLocation();

  // Home search hands off here: adopt the query once so the field shows what
  // Home promised, then leave the field owned locally afterwards.
  useEffect(() => {
    if (typeof q === "string" && q.length > 0) {
      setQuery(q);
    }
  }, [q]);

  const { data, error, isPending, refetch } = useDiscoverListings(
    query,
    filters,
    nearby.coords
  );

  const pieces = useMemo(
    () =>
      (data?.items ?? []).map((listing) =>
        listingToPiece(listing, {
          band: listing.distanceBand,
          meters: listing.distanceMeters,
        })
      ),
    [data]
  );
  const { favourites, items, onFavourite } = useCatalogueGrid(pieces);
  const count = activeFilterCount(filters);
  const hasNarrowing = count > 0 || query.trim().length > 0;

  return (
    <View className="flex-1 bg-background">
      <ProductGrid
        className="flex-1 px-4"
        emptyState={
          <DiscoverEmpty
            error={error}
            hasNarrowing={hasNarrowing}
            isPending={isPending}
            onRetry={() => refetch()}
          />
        }
        favourites={favourites}
        header={
          <View className="gap-5 pt-6 pb-2">
            <Text variant="headingXl">Discover</Text>

            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <SearchField
                  autoFocus={typeof q === "string"}
                  onChange={setQuery}
                  value={query}
                />
              </View>
              <Pressable
                accessibilityLabel={
                  count > 0 ? `Open filters, ${count} active` : "Open filters"
                }
                accessibilityRole="button"
                className={`size-12 items-center justify-center rounded-pill border border-border active:bg-muted ${count > 0 ? "bg-accent" : "bg-card"}`}
                onPress={() => setSheetOpen(true)}
              >
                <Icon
                  name="sliders"
                  tone={count > 0 ? "accent-foreground" : "foreground"}
                />
              </Pressable>
            </View>

            <LocationSlot nearby={nearby} />

            <View className="flex-row flex-wrap gap-3">
              {CATEGORIES.map((category) => (
                <Chip
                  key={category}
                  onPress={() =>
                    setFilters({ ...filters, categories: [category] })
                  }
                  selected={filters.categories.includes(category)}
                >
                  {category}
                </Chip>
              ))}
            </View>

            <AppliedFilters filters={filters} onChange={setFilters} />

            <SectionHeader
              caption={
                data
                  ? `${data.total} ${data.total === 1 ? "piece" : "pieces"}${nearby.coords ? " within 5 km" : ""}`
                  : "Searching…"
              }
              title={headingFor(query, nearby.coords !== null)}
            />
          </View>
        }
        items={items}
        onFavourite={onFavourite}
        onOpen={(id) => {
          const band = data?.items.find((item) => item.id === id)?.distanceBand;
          router.push(
            band
              ? { params: { band, id }, pathname: "/product/[id]" }
              : ROUTES.product(id)
          );
        }}
      />

      <FilterSheet
        filters={filters}
        onApply={setFilters}
        onClose={() => setSheetOpen(false)}
        open={sheetOpen}
        resultCount={data?.total ?? 0}
      />

      {state.favourites.length > 0 ? (
        <View className="px-4 pb-8">
          <Text tone="muted-foreground" variant="caption">
            {`${state.favourites.length} saved ${state.favourites.length === 1 ? "piece" : "pieces"}. Saved items live in your profile.`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
