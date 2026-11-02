import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

const STEPS = ["Photos", "Details", "Price", "Availability", "Review"] as const;

export default function NewListingScreen() {
  const router = useRouter();
  const { draft } = useListingDraft();
  const [step, setStep] = useState(0);

  return (
    <View className="flex-1 bg-background">
      <View className="px-gutter pt-6">
        <Text variant="headingLg">List an item</Text>
        <Text tone="muted-foreground" variant="bodySm">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </Text>
      </View>
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-4 py-4">
          <Text variant="bodyMd">Photos: {draft.photos.length}</Text>
          <Text variant="bodyMd">Title: {draft.title || "—"}</Text>
        </View>
      </ScrollView>
      <View className="flex-row gap-3 px-gutter pb-6">
        <Button
          disabled={step === 0}
          onPress={() => setStep((s) => Math.max(0, s - 1))}
          variant="soft"
        >
          Back
        </Button>
        <Button
          onPress={() => {
            if (step < STEPS.length - 1) setStep((s) => s + 1);
            else router.replace("/(tabs)/list");
          }}
        >
          {step < STEPS.length - 1 ? "Continue" : "Publish (demo)"}
        </Button>
      </View>
    </View>
  );
}
