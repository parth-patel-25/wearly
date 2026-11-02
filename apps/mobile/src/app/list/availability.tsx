import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Button } from "@wearly/ui-native/button";
import { Calendar } from "@wearly/ui-native/calendar";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

export default function AvailabilityScreen() {
  const router = useRouter();
  const { draft, set } = useListingDraft();
  const [range, setRange] = useState<{ end: string | null; start: string | null }>({ end: null, start: null });

  const toggle = (r: { end: string | null; start: string | null }) => {
    if (!r.start) return;
    const key = r.start;
    const next = draft.availability.includes(key)
      ? draft.availability.filter((d) => d !== key)
      : [...draft.availability, key];
    set({ availability: next });
    setRange({ end: null, start: null });
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-2 pt-4">
          <Text variant="headingLg">Set availability</Text>
          <Text tone="muted-foreground" variant="bodySm">
            Tap dates to mark unavailable. Blocked: {draft.availability.length}
          </Text>
        </View>
        <View className="mt-4">
          <Calendar blocked={draft.availability} onChange={toggle} range={range} />
        </View>
      </ScrollView>
      <View className="px-gutter pb-6">
        <Button onPress={() => router.push("/list/review" as any)}>Continue</Button>
      </View>
    </View>
  );
}
