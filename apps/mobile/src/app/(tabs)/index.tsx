import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import {
  CATALOGUE_DISCLAIMER,
  FEATURED,
  rentalSummary,
} from "@shared/data/catalogue";
import { useCatalogueGrid } from "@shared/hooks/use-catalogue-grid";
import { Chip } from "@wearly/ui-native/badge";
import { EmptyState, SectionHeader } from "@wearly/ui-native/display";
import type { PlaceholderTone } from "@wearly/ui-native/media";
import { Media } from "@wearly/ui-native/media";
import { ProductGrid } from "@wearly/ui-native/product-grid";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

/**
 * Home.
 *
 * Deliberately not a storefront. The order is: greet, offer one large thing,
 * offer a way in by mood, then let the grid happen. A user should feel "let me
 * explore", not "here is a catalogue".
 *
 * There is no search field here. Search belongs to Discover, which is where
 * someone goes when they already know what they want. Putting both on one screen
 * is how a home screen starts to feel like a database.
 */

const MOODS = [
  "For a weekend",
  "Wedding season",
  "Everyday",
  "At work",
] as const;

const CURATED_COUNT = 6;

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useSession();
  const { favourites, items, onFavourite } = useCatalogueGrid();

  const curated = useMemo(() => items.slice(0, CURATED_COUNT), [items]);
  const greeting = state.name
    ? `Good to see you, ${state.name.split(" ")[0] ?? ""}`
    : "Good morning";

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
          <HomeHeader
            greeting={greeting}
            onMood={() => router.navigate(ROUTES.discover)}
            onOpen={open}
          />
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

interface HomeHeaderProps {
  greeting: string;
  onMood: () => void;
  onOpen: (id: string) => void;
}

function HomeHeader({ greeting, onMood, onOpen }: HomeHeaderProps) {
  return (
    <View className="gap-10 pt-6 pb-2">
      <View className="gap-2">
        <Text tone="muted-foreground" variant="caption">
          {greeting}
        </Text>
        <Text variant="display">{"Wear it\nfor the moment."}</Text>
      </View>

      <FeaturedCard onPress={() => onOpen(FEATURED.id)} />

      <View className="gap-4">
        <SectionHeader caption="Start somewhere" title="Shop by mood" />
        <View className="flex-row flex-wrap gap-3">
          {MOODS.map((mood) => (
            <Chip key={mood} onPress={onMood}>
              {mood}
            </Chip>
          ))}
        </View>
      </View>

      <SectionHeader
        caption="Six pieces, chosen rather than scraped"
        title="Curated for you"
      />
    </View>
  );
}

interface FeaturedCardProps {
  onPress: () => void;
}

/** The one large thing. An editorial block, not merely a bigger product card. */
function FeaturedCard({ onPress }: FeaturedCardProps) {
  const summary = rentalSummary(FEATURED, 4);

  return (
    <Pressable
      accessibilityLabel={`Featured: ${FEATURED.name}, ${summary}`}
      accessibilityRole="button"
      className="w-full overflow-hidden rounded-card border border-border bg-card active:bg-muted"
      onPress={onPress}
    >
      <Media
        aspect="16/9"
        icon="sparkles"
        src={FEATURED.images[0]}
        tone={FEATURED.gallery[0] as PlaceholderTone}
      />
      <View className="gap-1 p-5">
        <Text variant="headingSm">{FEATURED.name}</Text>
        <Text tone="muted-foreground" variant="caption">
          {FEATURED.lender.name} · {FEATURED.lender.neighbourhood}
        </Text>
        <Text className="pt-2" variant="price">
          {summary}
        </Text>
      </View>
    </Pressable>
  );
}
