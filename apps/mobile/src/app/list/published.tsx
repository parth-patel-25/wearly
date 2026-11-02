import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { Image, View } from "react-native";

export default function PublishedScreen() {
  const router = useRouter();
  const { draft, clear } = useListingDraft();
  const cover = draft.photos.find((p) => p.cover) ?? draft.photos[0];
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background px-gutter">
      {cover ? <Image source={{ uri: cover.uri }} style={{ width: 160, height: 160, borderRadius: 16 }} /> : null}
      <Text variant="headingXl">Your listing is live!</Text>
      <Text tone="muted-foreground" variant="bodyMd">{draft.title}</Text>
      <Button onPress={() => { clear(); router.replace("/(tabs)/list" as any); }}>View my listing</Button>
      <Button onPress={() => { clear(); router.replace("/list/photos" as any); }} variant="soft">List another item</Button>
    </View>
  );
}
