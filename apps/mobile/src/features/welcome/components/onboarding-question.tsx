import { View } from "react-native";

import { OnboardingFooter } from "./onboarding-footer";
import { OptionGrid } from "./option-grid";
import { QuestionHeader } from "./question-header";

export interface OnboardingQuestionProps<T extends string> {
  /** Honest supporting line. Omit when there is nothing to say. */
  caption?: string;
  onPrimaryPress: () => void;
  onSelect: (option: T) => void;
  onSkipPress: () => void;
  options: readonly T[];
  primaryLabel: string;
  selected: T | null;
  /** 1-based position in the flow (2 or 3). */
  step: number;
  /** Editorial headline lines, one per line. */
  titleLines: readonly string[];
  totalSteps: number;
}

/**
 * One question chapter: editorial header, large choices, honest footer.
 *
 * Presentation only. Selection records on tap and advancing happens on the
 * primary button — never auto-advance. The state machine lives in the screen.
 */
export function OnboardingQuestion<T extends string>({
  caption,
  onPrimaryPress,
  onSelect,
  onSkipPress,
  options,
  primaryLabel,
  selected,
  step,
  titleLines,
  totalSteps,
}: OnboardingQuestionProps<T>) {
  return (
    <View className="flex-1 justify-between gap-10">
      <View className="gap-8">
        <QuestionHeader
          lines={titleLines}
          step={step}
          totalSteps={totalSteps}
        />
        <OptionGrid onSelect={onSelect} options={options} selected={selected} />
      </View>
      <OnboardingFooter
        caption={caption}
        onPrimaryPress={onPrimaryPress}
        onSkipPress={onSkipPress}
        primaryLabel={primaryLabel}
      />
    </View>
  );
}
