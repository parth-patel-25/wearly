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

const STEP_NUMBER: Record<Step, number> = {
  intro: 1,
  stylingFor: 2,
  wears: 3,
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { dispatch, state } = useSession();
  const [step, setStep] = useState<Step>("intro");

  const isIntro = step === "intro";
  const finish = () => {
    router.replace(ROUTES.home);
  };

  const chooseStylingFor = (style: string) => {
    dispatch({ field: "stylingFor", style, type: "personalise" });
    setStep("wears");
  };

  const chooseWears = (style: string) => {
    dispatch({ field: "wears", style, type: "personalise" });
    finish();
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
              onPick={chooseStylingFor}
              options={STYLING_FOR}
              title="Who are we styling for?"
            />
          ) : null}
          {step === "wears" ? (
            <Question
              onPick={chooseWears}
              options={WEARS}
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
          ) : null}
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
  title: string;
}

function Question({ onPick, options, title }: QuestionProps) {
  return (
    <View className="gap-6">
      <Text variant="headingXl">{title}</Text>
      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => (
          <Chip key={option} onPress={() => onPick(option)}>
            {option}
          </Chip>
        ))}
      </View>
    </View>
  );
}
