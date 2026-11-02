import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, View } from "react-native";

const MAX = 8;

export default function PhotosScreen() {
  const router = useRouter();
  const { draft, set } = useListingDraft();
  const [loading, setLoading] = useState(false);

  const pick = async (camera: boolean) => {
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow access in settings.");
      return;
    }
    setLoading(true);
    const res = camera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.9 })
      : await ImagePicker.launchImageLibraryAsync({
          allowsMultipleSelection: true,
          mediaTypes: ["images"],
          quality: 0.9,
          selectionLimit: MAX - draft.photos.length,
        });
    setLoading(false);
    if (res.canceled) return;
    const newPhotos = res.assets.map((a) => ({ id: a.assetId ?? a.uri, uri: a.uri }));
    const merged = [...draft.photos, ...newPhotos].slice(0, MAX);
    const coverSet = merged.map((p, i) => ({ ...p, cover: i === 0 }));
    set({ photos: coverSet });
  };

  const remove = (id: string) => {
    const filtered = draft.photos.filter((p) => p.id !== id);
    const coverSet = filtered.map((p, i) => ({ ...p, cover: i === 0 }));
    set({ photos: coverSet });
  };

  const setCover = (id: string) => {
    set({ photos: draft.photos.map((p) => ({ ...p, cover: p.id === id })) });
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-2 pt-4">
          <Text variant="headingLg">Add photos</Text>
          <Text tone="muted-foreground" variant="bodySm">
            Show front, back, fabric detail, label and any imperfections.
          </Text>
        </View>
        <View className="mt-4 flex-row flex-wrap gap-3">
          {draft.photos.map((p) => (
            <View className="relative" key={p.id} style={{ width: "30%" }}>
              <Image source={{ uri: p.uri }} style={{ aspectRatio: 1, borderRadius: 12, width: "100%" }} />
              {p.cover ? (
                <View className="absolute bottom-1 left-1 rounded-pill bg-primary px-2 py-0.5">
                  <Text tone="primary-foreground" variant="caption">Cover</Text>
                </View>
              ) : (
                <PressableCover onPress={() => setCover(p.id)} />
              )}
              <PressableRemove onPress={() => remove(p.id)} />
            </View>
          ))}
        </View>
        <View className="mt-6 gap-3">
          <Button disabled={loading || draft.photos.length >= MAX} onPress={() => pick(true)}>
            Take photo
          </Button>
          <Button disabled={loading || draft.photos.length >= MAX} onPress={() => pick(false)} variant="soft">
            Choose from gallery
          </Button>
        </View>
      </ScrollView>
      <View className="px-gutter pb-6">
        <Button disabled={draft.photos.length < 1} onPress={() => router.push("/list/details" as any)}>
          Continue
        </Button>
      </View>
    </View>
  );
}

function PressableCover({ onPress }: { onPress: () => void }) {
  const { Pressable } = require("react-native");
  return (
    <Pressable
      onPress={onPress}
      style={{ position: "absolute", bottom: 4, right: 4, backgroundColor: "#fff", borderRadius: 12, padding: 4 }}
    >
      <Text variant="caption">Set cover</Text>
    </Pressable>
  );
}

function PressableRemove({ onPress }: { onPress: () => void }) {
  const { Pressable } = require("react-native");
  return (
    <Pressable
      onPress={onPress}
      style={{ position: "absolute", top: 4, right: 4, backgroundColor: "#0008", borderRadius: 12, padding: 4 }}
    >
      <Text tone="primary-foreground" variant="caption">×</Text>
    </Pressable>
  );
}
