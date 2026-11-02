import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { Image, ScrollView, View } from "react-native";

export default function ReviewScreen() {
  const router = useRouter();
  const { draft } = useListingDraft();
  const cover = draft.photos.find((p) => p.cover) ?? draft.photos[0];

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-2 pt-6">
          <Text variant="headingLg">Review listing</Text>
        </View>
        {cover ? <Image source={{ uri: cover.uri }} style={{ height: 200, borderRadius: 16, marginTop: 12 }} /> : null}
        <View className="mt-4 gap-2">
          <Text variant="headingMd">{draft.title}</Text>
          <Text tone="muted-foreground" variant="bodySm">{draft.category} · {draft.size} · {draft.condition}</Text>
          <Text variant="bodyMd">{draft.description}</Text>
          <Text variant="bodyMd">₹{draft.pricePerDay}/day</Text>
        </View>
      </ScrollView>
      <View className="px-gutter pb-6 gap-3">
        <Button onPress={() => router.push("/list/published" as any)}>Publish listing</Button>
        <Button onPress={() => router.back()} variant="soft">Edit</Button>
      </View>
    </View>
  );
}
