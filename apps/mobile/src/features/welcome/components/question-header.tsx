import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

import { StepDots } from "./step-dots";

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
 * The shared step dots, then the question set large and centred like the
 * Screen 1 headline — the same story, now asking something. No progress bars,
 * no decoration.
 */
export function QuestionHeader({
  lines,
  step,
  totalSteps,
}: QuestionHeaderProps) {
  return (
    <View className="items-center gap-4">
      <StepDots current={step - 1} total={totalSteps} />
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
