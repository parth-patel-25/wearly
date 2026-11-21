import { Button } from "@wearly/ui-native/button";
import { Card } from "@wearly/ui-native/card";
import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";
import type { NearbyStatus } from "../hooks/use-nearby-location";

interface NearbyExplainerProps {
  onDismiss: () => void;
  onRequest: () => void;
  status: NearbyStatus;
}

/**
 * The location opt-in.
 *
 * It is a card, not a system prompt on mount: browsing never depends on a
 * permission the user did not ask to give. "Not now" is a real answer and the
 * text search still works.
 */
export function NearbyExplainer({
  onDismiss,
  onRequest,
  status,
}: NearbyExplainerProps) {
  const body = bodyFor(status);

  return (
    <Card className="gap-4 p-4" variant="muted">
      <View className="flex-row items-start gap-3">
        <View className="size-9 items-center justify-center rounded-pill bg-card">
          <Icon name="map-pin" size="sm" tone="muted-foreground" />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="bodyMd">Rent from people near you</Text>
          <Text tone="muted-foreground" variant="bodySm">
            {body}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        <Button
          disabled={status === "requesting"}
          onPress={onRequest}
          size="sm"
        >
          {status === "requesting" ? "Finding you…" : "Use my location"}
        </Button>
        <Button onPress={onDismiss} size="sm" variant="ghost">
          Not now
        </Button>
      </View>
    </Card>
  );
}

/** The quiet state once a fix exists: what it is used for, and how to undo it. */
export function NearbyActive({ onClear }: { onClear: () => void }) {
  return (
    <View className="flex-row items-center gap-2">
      <Icon name="map-pin" size="xs" tone="muted-foreground" />
      <Text className="flex-1" tone="muted-foreground" variant="caption">
        Sorted by distance within 5 km
      </Text>
      <Button onPress={onClear} size="sm" variant="ghost">
        Stop using location
      </Button>
    </View>
  );
}

function bodyFor(status: NearbyStatus): string {
  if (status === "denied") {
    return "Location permission is off. You can still search by area or by name — nothing else changes.";
  }
  if (status === "unavailable") {
    return "We could not get a location just now. Search by area or by name instead.";
  }
  return "Share a one-time location so pieces close to you come first. It is not stored, and exact addresses are never shown.";
}
