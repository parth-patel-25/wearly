import { Badge } from "@wearly/ui-native/badge";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

/**
 * The personalisation answers collected before sign-up.
 *
 * Shown only when at least one exists, so the section never appears empty.
 * These answers do not gate or rank anything yet, so the section states them
 * plainly rather than implying a personalisation the app does not perform.
 */

export interface ProfileStyleProps {
  stylingFor: string | null;
  wears: string | null;
}

export function ProfileStyle({ stylingFor, wears }: ProfileStyleProps) {
  return (
    <View className="gap-3">
      <Text variant="headingSm">Your style</Text>
      <View className="flex-row flex-wrap gap-2">
        {stylingFor ? (
          <Badge variant="primary">{`Styling for ${stylingFor}`}</Badge>
        ) : null}
        {wears ? <Badge variant="primary">{wears}</Badge> : null}
      </View>
    </View>
  );
}
