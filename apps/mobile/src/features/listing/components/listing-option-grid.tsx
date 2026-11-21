import {
  CONTROL_PRIMARY,
  CONTROL_SURFACE,
} from "@wearly/ui-native/control-tokens";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";

interface ListingOptionGridProps {
  onSelect: (value: string) => void;
  options: readonly string[];
  selected: string;
}

/** A compact single-choice grid for category and condition. */
export function ListingOptionGrid({
  onSelect,
  options,
  selected,
}: ListingOptionGridProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            className={`min-h-10 items-center justify-center rounded-card border px-3 py-2 ${
              isSelected
                ? `border-primary ${CONTROL_PRIMARY.surface}`
                : `border-border ${CONTROL_SURFACE.surface}`
            }`}
            key={option}
            onPress={() => onSelect(option)}
          >
            <Text
              tone={isSelected ? "primary-foreground" : "foreground"}
              variant="bodySm"
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
