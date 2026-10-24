import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NumericKeypadProps {
  onBackspace: () => void;
  onDigit: (digit: string) => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"] as const;
const ROWS = [
  "keypad-row-0",
  "keypad-row-1",
  "keypad-row-2",
  "keypad-row-3",
] as const;

export function NumericKeypad({ onBackspace, onDigit }: NumericKeypadProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="gap-2 rounded-t-sheet bg-secondary px-gutter pt-4"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View className="gap-2">
        {ROWS.map((rowKey, rowIndex) => (
          <View className="flex-row gap-2" key={rowKey}>
            {KEYS.slice(rowIndex * 3, rowIndex * 3 + 3).map((key) =>
              key === "" ? (
                <View className="flex-1" key={`spacer-${rowKey}`} />
              ) : (
                <Pressable
                  accessibilityLabel={`Digit ${key}`}
                  accessibilityRole="button"
                  className="h-14 flex-1 items-center justify-center rounded-input bg-card active:bg-accent"
                  key={`digit-${key}`}
                  onPress={() => onDigit(key)}
                >
                  <Text variant="headingSm">{key}</Text>
                </Pressable>
              )
            )}
            {rowIndex === 3 ? (
              <Pressable
                accessibilityLabel="Backspace"
                accessibilityRole="button"
                className="h-14 flex-1 items-center justify-center rounded-input bg-card active:bg-accent"
                key="backspace"
                onPress={onBackspace}
              >
                <Icon name="arrow-left" size="sm" tone="muted-foreground" />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
