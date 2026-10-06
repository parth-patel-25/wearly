import { AppList } from "@wearly/ui-native/app-list";
import { Chip } from "@wearly/ui-native/badge";
import { SectionHeader } from "@wearly/ui-native/display";
import { View } from "react-native";
import { HOME_OCCASIONS } from "../home-data";

/**
 * Occasion discovery.
 *
 * The most Wearly-specific block: users think in situations ("wedding next
 * Saturday"), not SKUs. Chips route into Discover so the need becomes a
 * filtered browse, not a dead end.
 */

interface OccasionChipRailProps {
  onSelect: (occasion: string) => void;
}

export function OccasionChipRail({ onSelect }: OccasionChipRailProps) {
  return (
    <View className="gap-4">
      <SectionHeader
        caption="Shop the situation, not the SKU"
        title="What are you dressing for?"
      />
      <AppList
        data={[...HOME_OCCASIONS]}
        horizontal
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <Chip icon={item.icon} onPress={() => onSelect(item.label)}>
            {item.label}
          </Chip>
        )}
        separator={<View className="w-3" />}
        showsScrollIndicator={false}
      />
    </View>
  );
}
