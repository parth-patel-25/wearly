import { Avatar } from "@wearly/ui-native/avatar";
import { IconButton } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";

/**
 * Personalised header.
 *
 * Light by design: a greeting, one contextual line, avatar and a single
 * notification action. Attention should fall through to the hero, not pool
 * here — so no background fill, no tabs, no second row.
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
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1 gap-1">
        <Text variant="headingLg">{greeting}</Text>
        <Text tone="muted-foreground" variant="bodySm">
          What are you dressing for?
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <IconButton
          accessibilityLabel="Notifications"
          icon="bell"
          onPress={onNotifications}
          variant="outline"
        />
        <Pressable
          accessibilityLabel={name ? `${name}'s profile` : "Profile"}
          accessibilityRole="button"
          onPress={onProfile}
        >
          <Avatar name={name ?? undefined} size="md" />
        </Pressable>
      </View>
    </View>
  );
}
