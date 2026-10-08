import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

export interface QuestionHeaderProps {
  /** Editorial lines, rendered one per line. */
  lines: readonly string[];
  /** 1-based position in the flow (2 or 3). */
  step: number;
  totalSteps: number;
}

/**
 * Editorial question header.
 *
 * A quiet `02 / 03` eyebrow, then the question set large and centred like the
 * Screen 1 headline — the same story, now asking something. No progress bars,
 * no decoration.
 */
export function QuestionHeader({
  lines,
  step,
  totalSteps,
}: QuestionHeaderProps) {
  const label = `${String(step).padStart(2, "0")} / ${String(totalSteps).padStart(2, "0")}`;

  return (
    <View className="items-center gap-4">
      <Text tone="muted-foreground" variant="caption">
        {label}
      </Text>
      <View className="gap-0">
        {lines.map((line) => (
          <Text
            className="text-center leading-tight"
            key={line}
            variant="displaySm"
          >
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}
