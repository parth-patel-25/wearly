import { ROUTES } from "@core/routing/routes";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { View } from "react-native";

/**
 * The lender side of the marketplace.
 *
 * Wearly is two-sided, so the invitation to lend belongs on Profile. It
 * links to the existing List destination — a real, honest screen that outlines
 * the guided flow rather than a dead control. The caption says the flow itself
 * is still to come; the prototype does not pretend otherwise.
 */

export function LendCta() {
  const router = useRouter();

  return (
    <View className="gap-3">
      <Text variant="headingSm">Have something to lend?</Text>
      <Button onPress={() => router.push(ROUTES.list)} variant="soft">
        Lend with Wearly
      </Button>
      <Text tone="muted-foreground" variant="caption">
        Sharing pieces with Wearly opens when the guided listing flow ships.
      </Text>
    </View>
  );
}
