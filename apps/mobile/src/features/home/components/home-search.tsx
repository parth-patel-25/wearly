import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";

/**
 * Elegant search entry.
 *
 * A faux field, not an input: Home never filters locally. Tapping hands off
 * to Discover with the query (if any) so the real `SearchField` there takes
 * over, focused. Keeps Home calm and Discover the one place search lives.
 */

interface HomeSearchProps {
  onFilters: () => void;
  onPress: () => void;
}

export function HomeSearch({ onFilters, onPress }: HomeSearchProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityHint="Opens Discover search"
        accessibilityLabel="Search dresses, looks, jackets"
        accessibilityRole="search"
        className="min-h-12 flex-1 flex-row items-center gap-3 rounded-pill border border-border bg-card px-5 active:bg-muted"
        onPress={onPress}
      >
        <Icon name="search" size="sm" tone="muted-foreground" />
        <Text tone="muted-foreground" variant="bodyMd">
          Search dresses, looks, jackets…
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Open filters"
        accessibilityRole="button"
        className="size-12 items-center justify-center rounded-pill border border-border bg-card active:bg-muted"
        onPress={onFilters}
      >
        <Icon name="sliders" tone="foreground" />
      </Pressable>
    </View>
  );
}
