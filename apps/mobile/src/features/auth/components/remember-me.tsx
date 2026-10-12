import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";

/**
 * The "Remember me" checkbox.
 *
 * A native-feeling check box with a real `checkbox` role: the box fills
 * primary with a check when on, and the label quiets to muted tones when
 * unchecked so the row reads as optional rather than default.
 */

interface RememberMeProps {
  checked: boolean;
  onToggle: () => void;
}

export function RememberMe({ checked, onToggle }: RememberMeProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-row items-center gap-2"
      hitSlop={8}
      onPress={onToggle}
    >
      <View
        className={`size-5 items-center justify-center rounded-xs border ${
          checked ? "border-primary bg-primary" : "border-border bg-card"
        }`}
      >
        {checked ? (
          <Icon name="check" size="xs" tone="primary-foreground" />
        ) : null}
      </View>
      <Text tone={checked ? "foreground" : "muted-foreground"} variant="bodySm">
        Remember me
      </Text>
    </Pressable>
  );
}
