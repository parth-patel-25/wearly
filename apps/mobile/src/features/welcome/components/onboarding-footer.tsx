import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

export interface OnboardingFooterProps {
  /** Supporting honest caption. Omit when there is nothing to say. */
  caption?: string;
  onPrimaryPress: () => void;
  onSkipPress: () => void;
  primaryLabel: string;
}

/**
 * Skip + primary + honest caption.
 *
 * Owns no flow logic — it only reports which button was tapped. The state
 * machine stays in the screen.
 */
export function OnboardingFooter({
  caption,
  onPrimaryPress,
  onSkipPress,
  primaryLabel,
}: OnboardingFooterProps) {
  return (
    <View className="gap-3">
      <Button onPress={onSkipPress} size="lg" variant="ghost">
        Skip this
      </Button>
      <Button onPress={onPrimaryPress} size="lg">
        {primaryLabel}
      </Button>
      {caption ? (
        <Text className="text-center" tone="muted-foreground" variant="caption">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
