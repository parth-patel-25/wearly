import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { FilterSheet } from "@features/discover/components/filter-sheet";
import { CATALOGUE, CATEGORIES, CONDITION_LABEL } from "@shared/data/catalogue";
import type { Filters } from "@shared/data/filters";
import {
  activeFilterCount,
  applyFilters,
  NO_FILTERS,
} from "@shared/data/filters";
import { useCatalogueGrid } from "@shared/hooks/use-catalogue-grid";
import { Chip } from "@wearly/ui-native/badge";
import { Button } from "@wearly/ui-native/button";
import { EmptyState, SectionHeader } from "@wearly/ui-native/display";
import { SearchField } from "@wearly/ui-native/fields";
import { ProductGrid } from "@wearly/ui-native/product-grid";
import { Text } from "@wearly/ui-native/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

/**
 * Discover.
 *
 * Search, a category rail, and a filter sheet. Three affordances, no more — the
 * screen's job is to narrow seventy-two pieces down to a handful, and every
 * extra control on it costs a decision the user did not ask to make.
 *
 * The applied-filter summary sits directly under the search field and shows what
 * is currently narrowing the grid, each one individually removable. Without it,
 * an empty result is indistinguishable from a broken screen.
 */

export default function DiscoverScreen() {
  const router = useRouter();
  const { state } = useSession();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Home search hands off here: adopt the query once so the field shows what
  // Home promised, then leave the field owned locally afterwards.
  useEffect(() => {
    if (typeof q === "string" && q.length > 0) {
      setQuery(q);
    }
  }, [q]);

  const results = useMemo(
    () => search(applyFilters(CATALOGUE, filters), query),
    [filters, query]
  );
  const { favourites, items, onFavourite } = useCatalogueGrid(results);
  const count = activeFilterCount(filters);

  return (
    <View className="flex-1 bg-background">
      <ProductGrid
        emptyState={
          <EmptyState
            body="Try removing a filter, or search for something broader."
            icon="search"
            title="Nothing matches yet"
          />
        }
        favourites={favourites}
        header={
          <View className="gap-6 pt-6 pb-2">
            <View className="flex-row items-center justify-between gap-3">
              <Text variant="headingXl">Discover</Text>
              <Button
                onPress={() => setSheetOpen(true)}
                size="sm"
                variant={count > 0 ? "soft" : "outline"}
              >
                {count > 0 ? `Filters · ${count}` : "Filters"}
              </Button>
            </View>

            <SearchField
              autoFocus={typeof q === "string"}
              onChange={setQuery}
              value={query}
            />

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
              caption={`${results.length} of ${CATALOGUE.length} pieces`}
              title={query ? `Results for “${query}”` : "Everything"}
            />
          </View>
        }
        items={items}
        onFavourite={onFavourite}
        onOpen={(id) => router.push(ROUTES.product(id))}
      />

      <FilterSheet
        filters={filters}
        onApply={setFilters}
        onClose={() => setSheetOpen(false)}
        open={sheetOpen}
        resultCount={results.length}
      />

      {state.favourites.length > 0 ? (
        <SavedHint count={state.favourites.length} />
      ) : null}
    </View>
  );
}

interface AppliedFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

function AppliedFilters({ filters, onChange }: AppliedFiltersProps) {
  const labels = [
    ...filters.categories,
    ...filters.sizes,
    ...filters.conditions.map((condition) => CONDITION_LABEL[condition]),
    ...(filters.maxDailyRate ? [`Up to ₹${filters.maxDailyRate}`] : []),
  ];

  if (labels.length === 0 && !filters.from) {
    return null;
  }

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      {labels.map((label) => (
        <Chip key={label} onPress={() => removeOne(filters, onChange, label)}>
          {`${label} ✕`}
        </Chip>
      ))}
      <Chip onPress={() => onChange(NO_FILTERS)}>Clear all</Chip>
    </View>
  );
}

function removeOne(
  filters: Filters,
  onChange: (next: Filters) => void,
  label: string
): void {
  const without = <T,>(list: readonly T[], value: T) =>
    list.filter((item) => item !== value);

  onChange({
    ...filters,
    categories: without(
      filters.categories,
      label as (typeof filters.categories)[number]
    ),
    conditions: without(
      filters.conditions,
      label as (typeof filters.conditions)[number]
    ),
    maxDailyRate: label.startsWith("Up to") ? null : filters.maxDailyRate,
    sizes: without(filters.sizes, label),
  });
}

function search(pieces: typeof CATALOGUE, query: string) {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) {
    return pieces;
  }
  return pieces.filter(
    (piece) =>
      piece.name.toLowerCase().includes(trimmed) ||
      piece.category.toLowerCase().includes(trimmed) ||
      piece.lender.neighbourhood.toLowerCase().includes(trimmed)
  );
}

function SavedHint({ count }: { count: number }) {
  return (
    <View className="px-gutter pb-8">
      <Text tone="muted-foreground" variant="caption">
        {`${count} saved ${count === 1 ? "piece" : "pieces"}. Saved items live in your profile.`}
      </Text>
    </View>
  );
}
