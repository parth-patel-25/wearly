import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { OnboardingHero } from "@features/welcome/components/onboarding-hero";
import { Chip } from "@wearly/ui-native/badge";
import { BrandMark } from "@wearly/ui-native/brand-mark";
import { Button } from "@wearly/ui-native/button";
import { Screen } from "@wearly/ui-native/screen";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

/**
 * Welcome.
 *
 * Three steps, and they are not three of the same thing.
 *
 * Step 1 is the fashion moment — a photograph, a headline, and a swipe to
 * continue. It is the only screen that asks nothing, which is what lets it be the
 * only screen that asks for a gesture. Steps 2 and 3 ask two questions, asked
 * like a conversation rather than a form, and they keep their tap buttons: a
 * drag gate on a screen offering four answers is hostile. Both are before any
 * account is requested, because the first thing a new user should feel is that
 * they are welcome, not that they are being onboarded.
 *
 * Picking an answer and moving on are deliberately **two** taps. Advancing in the
 * press handler would unmount the chip on the same frame it was chosen, so the
 * selected state would never be seen — a choice that does not visibly register is
 * a choice the user is not sure they made, and they tap again.
 *
 * Each question opens with one chip already selected, so the flow can be answered
 * by simply moving on. That default is a *display* default only: it is shown as
 * chosen but never written to the session, so a user who taps straight through has
 * answered nothing and the footer keeps saying so. `Everyone` is the default for
 * the styling question because presuming a gender would be a worse first
 * impression than asking.
 *
 * The answers are stored but never used to gate anything. A prototype that
 * pretended to personalise a ranking it does not have would be exactly the fake
 * social proof the product spec forbids.
 */

const STYLING_FOR = ["Women", "Men", "Kids", "Everyone"] as const;
const WEARS = [
  "Casual",
  "Traditional",
  "Party",
  "Formal",
  "Streetwear",
  "Minimal",
] as const;

type Step = "intro" | "stylingFor" | "wears";

type QuestionStep = Exclude<Step, "intro">;

/** Display order of the steps, for the pager and the header counter. */
const STEPS: readonly Step[] = ["intro", "stylingFor", "wears"];

const TOTAL_STEPS = STEPS.length;

const STEP_NUMBER: Record<Step, number> = {
  intro: 1,
  stylingFor: 2,
  wears: 3,
};

const DEFAULT_ANSWER: Record<QuestionStep, string> = {
  stylingFor: "Everyone",
  wears: "Casual",
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { dispatch, state } = useSession();
  const [step, setStep] = useState<Step>("intro");

  const isIntro = step === "intro";
  const isWears = step === "wears";
  const field: QuestionStep = isWears ? "wears" : "stylingFor";

  /**
   * What the chip row highlights. A default stands in until the user picks for
   * themselves, so the screen is never in a state where nothing is selected.
   */
  const selected = state[field] ?? DEFAULT_ANSWER[field];

  /** Records the answer and nothing else. Advancing is a separate, later tap. */
  const pick = (style: string) => {
    dispatch({ field, style, type: "personalise" });
  };

  const finish = () => {
    router.replace(ROUTES.home);
  };

  const advance = () => {
    if (isWears) {
      finish();
      return;
    }
    setStep("wears");
  };

  /**
   * Stable across renders, so the swipe gesture — which closes over it — is
   * built once and never rebuilt mid-drag. An inline arrow here would hand the
   * gesture a new identity on every render, and rebuilding a `Pan` while a
   * finger is down cancels the drag it was tracking.
   */
  const goToStyling = useCallback(() => setStep("stylingFor"), []);

  return (
    <Screen className="flex-1 bg-background" scrollable={false}>
      <View className="flex-1 gap-6 px-4 pt-4 pb-6">
        <View className="flex-row items-center justify-between">
          <BrandMark size={40} />
          <Text tone="muted-foreground" variant="caption">
            {`Step ${STEP_NUMBER[step]} of ${TOTAL_STEPS}`}
          </Text>
        </View>

        {isIntro ? (
          <OnboardingHero
            onSwipeComplete={goToStyling}
            step={STEPS.indexOf(step)}
            totalSteps={TOTAL_STEPS}
          />
        ) : (
          <View className="flex-1 justify-between gap-10">
            {step === "stylingFor" ? (
              <Question
                onPick={pick}
                options={STYLING_FOR}
                selected={selected}
                title="Who are we styling for?"
              />
            ) : (
              <Question
                onPick={pick}
                options={WEARS}
                selected={selected}
                title="What do you usually wear?"
              />
            )}

            <View className="gap-3">
              <Button onPress={finish} size="lg" variant="ghost">
                Skip this
              </Button>
              <Button onPress={advance} size="lg">
                {isWears ? "Start browsing" : "Next"}
              </Button>
              <Text
                className="text-center"
                tone="muted-foreground"
                variant="caption"
              >
                {state.stylingFor === null
                  ? "You can browse without an account."
                  : `Styling for ${state.stylingFor}. You can browse without an account.`}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

interface QuestionProps {
  onPick: (option: string) => void;
  options: readonly string[];
  /** Answers already given, so a picked option can show as selected. */
  selected: string | null;
  title: string;
}

function Question({ selected, onPick, options, title }: QuestionProps) {
  return (
    <View className="gap-6">
      <Text variant="headingXl">{title}</Text>
      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => (
          <Chip
            key={option}
            onPress={() => onPick(option)}
            selected={selected === option}
          >
            {option}
          </Chip>
        ))}
      </View>
    </View>
  );
}
