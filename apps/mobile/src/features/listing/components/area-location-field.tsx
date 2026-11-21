import {
  type NearbyCoordinates,
  useNearbyLocation,
} from "@features/discover/hooks/use-nearby-location";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

interface AreaLocationFieldProps {
  error?: string;
  hasLocation: boolean;
  onAreaChange: (value: string) => void;
  onLocation: (coords: NearbyCoordinates) => void;
  value: string;
}

/**
 * Where the piece is — publicly an area, privately an optional coordinate.
 *
 * Location is asked for here, with a button, because a listing works without
 * it. The coordinate only ranks this listing in nearby results; it is never
 * returned to another user.
 */
export function AreaLocationField({
  error,
  hasLocation,
  onAreaChange,
  onLocation,
  value,
}: AreaLocationFieldProps) {
  const nearby = useNearbyLocation();

  const addLocation = async () => {
    const coords = await nearby.request();
    if (coords) {
      onLocation(coords);
    }
  };

  const failed = nearby.status === "denied" || nearby.status === "unavailable";

  return (
    <View className="gap-3">
      <TextField
        error={error}
        hint="Public. Your exact address is never shown."
        label="Area"
        onChangeText={onAreaChange}
        placeholder="Bandra West"
        value={value}
      />
      {hasLocation ? (
        <Text tone="success" variant="caption">
          Location added — used only to rank you nearby.
        </Text>
      ) : (
        <Button
          disabled={nearby.status === "requesting"}
          onPress={addLocation}
          size="sm"
          variant="outline"
        >
          {nearby.status === "requesting"
            ? "Finding you…"
            : "Add my location (optional)"}
        </Button>
      )}
      {failed ? (
        <Text tone="muted-foreground" variant="caption">
          No location added. Your listing still works; it just will not appear
          in nearby results.
        </Text>
      ) : null}
      <Text tone="muted-foreground" variant="caption">
        Meetups are only agreed with someone whose request you accept.
      </Text>
    </View>
  );
}
