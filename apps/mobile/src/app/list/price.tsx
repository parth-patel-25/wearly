import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function PriceScreen() {
  const router = useRouter();
  const { draft, set } = useListingDraft();
  const [error, setError] = useState("");

  const next = () => {
    const price = Number(draft.pricePerDay);
    if (!price || price <= 0) {
      setError("Price must be positive");
      return;
    }
    setError("");
    router.push("/list/availability" as any);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-background">
      <ScrollView
        automaticallyAdjustKeyboardInsets
        className="flex-1 px-gutter"
        contentContainerStyle={{ paddingBottom: 96 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2 pt-6">
          <Text variant="headingLg">Set rental price</Text>
        </View>
        <View className="mt-4 gap-4">
          <TextField
            keyboardType="numeric"
            label="Price per day (₹)"
            onChangeText={(v) => set({ pricePerDay: v })}
            value={draft.pricePerDay}
            error={error}
          />
          <Text tone="muted-foreground" variant="bodySm">
            Earnings preview: ₹{draft.pricePerDay || "0"}/day. Platform fees apply per policy.
          </Text>
        </View>
      </ScrollView>
      <View className="px-gutter pb-6 pt-2">
        <Button onPress={next}>Continue</Button>
      </View>
    </KeyboardAvoidingView>
  );
}
