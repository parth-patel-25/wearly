import { Panel } from "@wearly/ui-native/card";
import { ProgressBar } from "@wearly/ui-native/display";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

import type { ProfileState } from "../profile-progress";
import { PROFILE_STEPS, profileProgress } from "../profile-progress";

/**
 * Compact profile completion.
 *
 * The progress bar is near the top on purpose: the psychological job is "I've
 * already started", so the first thing after the person is evidence that
 * progress exists. Only achievable steps count — see `profile-progress.ts` —
 * so the number can honestly reach 100% and never stalls on a feature that has
 * not shipped.
 */

export interface ProfileProgressPanelProps {
  state: ProfileState;
}

export function ProfileProgressPanel({ state }: ProfileProgressPanelProps) {
  const { completed, percent } = profileProgress(state);
  const isComplete = percent >= 100;
  let message = "Nice. We're getting to know your style.";
  if (isComplete) {
    message = "Your profile is complete. Everything else is optional.";
  } else if (completed === 0) {
    message =
      "Nothing here is urgent. An account is only needed to rent and to list.";
  }

  return (
    <Panel
      subtitle="Step by step, whenever you like"
      title="Let's make Wearly yours"
    >
      <View className="gap-4">
        <ProgressBar label="Profile" value={percent} />

        <View className="gap-1">
          {PROFILE_STEPS.map((step) => {
            const isDone = step.done(state);
            return (
              <View
                className="flex-row items-center gap-3 py-1"
                key={step.label}
              >
                <View
                  className={`size-2 rounded-pill ${isDone ? "bg-success" : "bg-border"}`}
                />
                <Text
                  tone={isDone ? "foreground" : "muted-foreground"}
                  variant="bodySm"
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        <Text tone="muted-foreground" variant="caption">
          {message}
        </Text>
      </View>
    </Panel>
  );
}
