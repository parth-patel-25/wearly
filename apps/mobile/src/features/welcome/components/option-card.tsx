import {
  CONTROL_PRIMARY,
  CONTROL_SURFACE,
} from "@wearly/ui-native/control-tokens";
import { AnimatedPressable, usePressScale } from "@wearly/ui-native/motion";
import { Text } from "@wearly/ui-native/text";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";

export interface OptionCardProps {
  label: string;
  onPress: () => void;
  selected: boolean;
}

function fireLight(): void {
  impactAsync(ImpactFeedbackStyle.Light).catch(() => {
    /* no haptics on this device */
  });
}

/**
 * One large selectable answer.
 *
 * A tactile surface, not a small chip: roomy, quiet at rest, unmistakably rose
 * when chosen. Press compresses slightly and springs back — feedback only,
 * never navigation. Selection is exposed to assistive tech, never colour alone.
 */
export function OptionCard({ label, onPress, selected }: OptionCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.96);

  const handlePress = () => {
    fireLight();
    onPress();
  };

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`min-h-20 flex-1 items-center justify-center rounded-card border px-4 py-5 ${
        selected
          ? `border-primary ${CONTROL_PRIMARY.surface} ${CONTROL_PRIMARY.pressed}`
          : `border-border ${CONTROL_SURFACE.surface} ${CONTROL_SURFACE.pressed}`
      }`}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
    >
      <Text
        className="text-center"
        tone={selected ? CONTROL_PRIMARY.tone : CONTROL_SURFACE.tone}
        variant="buttonLg"
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
