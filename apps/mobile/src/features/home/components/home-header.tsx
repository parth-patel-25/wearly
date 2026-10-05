import { Avatar } from "@wearly/ui-native/avatar";
import { IconButton } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";

/**
 * Personalised header.
 *
 * One row: avatar first, then the greeting with its contextual line, then a
 * single notification action at the end. Attention should fall through to the
 * content below, not pool here — so no background fill, no tabs, no second
 * row, and the greeting stays a step down from hero type.
 */

interface HomeHeaderProps {
  name: string | null;
  onNotifications: () => void;
  onProfile: () => void;
}

function greetingFor(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function HomeHeader({
  name,
  onNotifications,
  onProfile,
}: HomeHeaderProps) {
  const firstName = name?.split(" ")[0];
  const greeting = firstName
    ? `${greetingFor()}, ${firstName} 👋`
    : `${greetingFor()} 👋`;

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityLabel={name ? `${name}'s profile` : "Profile"}
        accessibilityRole="button"
        onPress={onProfile}
      >
        <Avatar name={name ?? undefined} size="lg" />
      </Pressable>
      <View className="flex-1 justify-center gap-0">
        {/* `buttonLg` (16px, medium) keeps the medium weight one step down —
            stacked tight over the bodySm description, still locked to one line. */}
        <Text numberOfLines={1} variant="buttonLg">
          {greeting}
        </Text>
        <Text tone="muted-foreground" variant="bodySm">
          What are you dressing for?
        </Text>
      </View>
      <IconButton
        accessibilityLabel="Notifications"
        icon="bell"
        onPress={onNotifications}
        variant="outline"
      />
    </View>
  );
}
