import type { IconName } from "@wearly/ui-native/icon";
import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";

/**
 * A row inside a Profile settings group.
 *
 * One contract: an icon, a label, an optional supporting line and, when the row
 * does something, a chevron. A row with no `onPress` is a statement rather than
 * a control, so it renders passively and carries no affordance it cannot
 * honour.
 */

export interface ProfileRowProps {
  detail?: string;
  disabled?: boolean;
  icon: IconName;
  label: string;
  onPress?: () => void;
  tone?: "default" | "destructive";
}

const ICON_SURFACE = {
  default: "bg-accent",
  destructive: "bg-destructive-background",
} as const;

const ICON_TONE = {
  default: "accent-foreground",
  destructive: "destructive",
} as const;

export function ProfileRow({
  detail,
  disabled = false,
  icon,
  label,
  onPress,
  tone = "default",
}: ProfileRowProps) {
  const content = (
    <>
      <View
        className={`size-9 items-center justify-center rounded-pill ${ICON_SURFACE[tone]}`}
      >
        <Icon name={icon} size="sm" tone={ICON_TONE[tone]} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          tone={tone === "destructive" ? "destructive" : "foreground"}
          variant="bodyMd"
        >
          {label}
        </Text>
        {detail ? (
          <Text tone="muted-foreground" variant="caption">
            {detail}
          </Text>
        ) : null}
      </View>
      {onPress ? (
        <Icon name="chevron-right" size="sm" tone="muted-foreground" />
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View className="min-h-11 flex-row items-center gap-3 px-4 py-2">
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className="min-h-11 flex-row items-center gap-3 rounded-card px-4 py-2 active:bg-muted"
      disabled={disabled}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}
