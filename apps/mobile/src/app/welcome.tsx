import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { Chip } from "@wearly/ui-native/badge";
import { BrandMark } from "@wearly/ui-native/brand-mark";
import { Button } from "@wearly/ui-native/button";
import { Screen } from "@wearly/ui-native/screen";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

/**
 * Welcome.
 *
 * Two questions, asked like a conversation rather than a form — and asked
 *before* anyone is asked to make an account. Everything here is optional and
 * skippable, because the first thing a new user should feel is that they are
 * welcome, not that they are being onboarded.
 *
 * Picking an answer and moving on are deliberately **two** taps. Advancing in
 * the press handler would unmount the chip on the same frame it was chosen, so
 * the selected state would never be seen — a choice that does not visibly
 * register is a choice the user is not sure they made, and they tap again.
 *
 * Each question opens with one chip already selected, so the flow can be
 * answered by simply moving on. That default is a *display* default only: it is
 * shown as chosen but never written to the session, so a user who taps straight
 * through has answered nothing and the footer keeps saying so. `Everyone` is the
 * default for the styling question because presuming a gender would be a worse
 * first impression than asking.
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

  return (
    <Screen className="flex-1 bg-background" scrollable={false}>
      <View className="flex-1 justify-between gap-10 px-page-inline pt-6 pb-8">
        <View className="flex-row items-center justify-between">
          <BrandMark size={40} />
          <Text tone="muted-foreground" variant="caption">
            {`Step ${STEP_NUMBER[step]} of 3`}
          </Text>
        </View>

        <View className="gap-4">
          {isIntro ? <Intro /> : null}
          {step === "stylingFor" ? (
            <Question
              onPick={pick}
              options={STYLING_FOR}
              selected={selected}
              title="Who are we styling for?"
            />
          ) : null}
          {step === "wears" ? (
            <Question
              onPick={pick}
              options={WEARS}
              selected={selected}
              title="What do you usually wear?"
            />
          ) : null}
        </View>

        <View className="gap-3">
          {isIntro ? null : (
            <Button onPress={finish} size="lg" variant="ghost">
              Skip this
            </Button>
          )}
          {isIntro ? (
            <Button onPress={() => setStep("stylingFor")} size="lg">
              Show me around
            </Button>
          ) : (
            <Button onPress={advance} size="lg">
              {isWears ? "Start browsing" : "Next"}
            </Button>
          )}
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
    </Screen>
  );
}

function Intro() {
  return (
    <View className="gap-4">
      <Text variant="display">
        Borrow a beautiful{"\n"}thing for a{"\n"}weekend.
      </Text>
      <Text tone="muted-foreground" variant="bodyLg">
        Rent clothing from people nearby, for a few days at a time. No account
        needed to look around.
      </Text>
    </View>
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
