import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  CONTROL_PRIMARY,
  CONTROL_SURFACE,
} from "@wearly/ui-native/control-tokens";
import { AnimatedPressable, usePressScale } from "@wearly/ui-native/motion";
import { Text } from "@wearly/ui-native/text";
import { useToneColor } from "@wearly/ui-native/tone";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import type { ComponentProps } from "react";

export type OptionIconName =
  | {
      family: "fontawesome6";
      name: ComponentProps<typeof FontAwesome6>["name"];
    }
  | {
      family: "material-community";
      name: ComponentProps<typeof MaterialCommunityIcons>["name"];
    };

export interface OptionCardProps {
  icon?: OptionIconName;
  label: string;
  onPress: () => void;
  selected: boolean;
}

function fireLight(): void {
  impactAsync(ImpactFeedbackStyle.Light).catch(() => {
    /* no haptics on this device */
  });
}

/** The optional glyph — one branch per icon family, never nested. */
function OptionGlyph({
  color,
  icon,
}: {
  color: string;
  icon?: OptionIconName;
}) {
  if (icon === undefined) {
    return null;
  }
  if (icon.family === "fontawesome6") {
    return <FontAwesome6 color={color} name={icon.name} size={26} />;
  }
  return <MaterialCommunityIcons color={color} name={icon.name} size={28} />;
}

/**
 * One large selectable answer.
 *
 * A tactile surface, not a small chip: roomy, quiet at rest, unmistakably rose
 * when chosen. Press compresses slightly and springs back — feedback only,
 * never navigation. Selection is exposed to assistive tech, never colour alone.
 */
export function OptionCard({
  icon,
  label,
  onPress,
  selected,
}: OptionCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.96);

  const handlePress = () => {
    fireLight();
    onPress();
  };

  const control = selected ? CONTROL_PRIMARY : CONTROL_SURFACE;
  const iconColor = useToneColor(control.tone);

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`min-h-20 flex-1 items-center justify-center gap-2 rounded-card border px-4 py-5 ${
        selected
          ? `border-primary ${CONTROL_PRIMARY.surface} ${CONTROL_PRIMARY.pressed}`
          : `border-border ${CONTROL_SURFACE.surface} ${CONTROL_SURFACE.pressed}`
      }`}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
    >
      <OptionGlyph color={iconColor} icon={icon} />
      <Text className="text-center" tone={control.tone} variant="buttonLg">
        {label}
      </Text>
    </AnimatedPressable>
  );
}
