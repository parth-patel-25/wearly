import { AppList } from "@wearly/ui-native/app-list";
import { Chip } from "@wearly/ui-native/badge";
import { SectionHeader } from "@wearly/ui-native/display";
import { View } from "react-native";
import { HOME_CATEGORIES } from "../home-data";

/**
 * Category rail.
 *
 * Horizontally scrollable chips, `✨ For You` first to signal personalisation.
 * Light and tactile — selected state only, no thumbnails, no oversized pills.
 */

interface CategoryRailProps {
  onSeeAll: () => void;
  onSelect: (category: string) => void;
  selected: string;
}

export function CategoryRail({
  onSeeAll,
  onSelect,
  selected,
}: CategoryRailProps) {
  return (
    <View className="gap-4">
      <SectionHeader
        action={
          <Chip onPress={onSeeAll} selected={false}>
            See all
          </Chip>
        }
        title="Categories"
      />
      <AppList
        data={[...HOME_CATEGORIES]}
        horizontal
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Chip onPress={() => onSelect(item)} selected={item === selected}>
            {item}
          </Chip>
        )}
        separator={<View className="w-3" />}
        showsScrollIndicator={false}
      />
    </View>
  );
}
