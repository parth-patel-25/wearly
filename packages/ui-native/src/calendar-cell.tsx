import { Pressable, View } from "react-native";

import { Icon } from "./icon";
import { Text } from "./text";
import type { Tone } from "./tone";

/**
 * The calendar's two small pieces of chrome, kept out of `calendar.tsx` so the
 * grid logic there is not buried under a day button and an arrow button.
 *
 * A cell is a 44px-plus target with a 40px visual disc, so the touch area is
 * larger than the thing you aim at. Unavailable days are struck through *and*
 * marked `disabled` in the accessibility state, so they are never distinguished
 * by colour alone.
 */

const CELL_WIDTH = "w-[14.28%]";
const DISC_SELECTED = "bg-primary";
const DISC_DEFAULT = "bg-accent";
const SELECTED_TEXT: Tone = "primary-foreground";

export interface DayCellProps {
  blocked: boolean;
  isEnd: boolean;
  isPast: boolean;
  isStart: boolean;
  label: string;
  onPress: (key: string) => void;
}

export function DayCell({
  blocked,
  isEnd,
  isPast,
  isStart,
  label,
  onPress,
}: DayCellProps) {
  const selected = isStart || isEnd;
  const unavailable = blocked || isPast;
  const day = Number(label.slice(-2));
  const baseTone: Tone = unavailable ? "muted-foreground" : "foreground";
  const tone = selected ? SELECTED_TEXT : baseTone;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, selected }}
      className={`h-12 ${CELL_WIDTH} items-center justify-center`}
      disabled={unavailable}
      onPress={() => onPress(label)}
    >
      <View
        className={`size-10 items-center justify-center rounded-pill ${selected ? DISC_SELECTED : DISC_DEFAULT}`}
      >
        <Text
          className={unavailable ? "line-through" : ""}
          tone={tone}
          variant="bodySm"
        >
          {day}
        </Text>
      </View>
    </Pressable>
  );
}

export interface NavButtonProps {
  icon: "chevron-left" | "chevron-right";
  label: string;
  onPress: () => void;
}

export function NavButton({ icon, label, onPress }: NavButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="size-11 items-center justify-center rounded-pill bg-muted active:bg-accent"
      onPress={onPress}
    >
      <Icon name={icon} size="sm" tone="foreground" />
    </Pressable>
  );
}

export const CALENDAR_CELL_WIDTH = CELL_WIDTH;
