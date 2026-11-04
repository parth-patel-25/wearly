import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { API_ROUTES } from "@wearly/shared/api/routes";
import { authClient } from "@/lib/auth-client";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { Skeleton } from "@wearly/ui-native/skeleton";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "@wearly/ui-native/toast";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, View } from "react-native";

const MAX = 8;

export default function PhotosScreen() {
  const router = useRouter();
  const { draft, set } = useListingDraft();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<string[]>([]);

  const pick = async (camera: boolean) => {
    setLoading(true);
    try {
      const res = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            quality: 0.9,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsMultipleSelection: true,
            selectionLimit: MAX - draft.photos.length,
            quality: 0.9,
          });
      if (res.canceled || !res.assets?.length) return;
      const assets = res.assets.slice(0, MAX - draft.photos.length);
      setPending(assets.map((a) => a.uri));
      // Upload each picked asset to the Supabase bucket via a signed URL
      // issued by the API, then store the resulting public URL in the draft.
      try {
        let currentPhotos = draft.photos;
        for (const a of assets) {
          const filename = a.fileName ?? `photo-${Date.now()}.jpg`;
          const contentType = a.mimeType ?? "image/jpeg";
          const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
          const uploadUrlEndpoint = `${apiBase}${API_ROUTES.STORAGE.UPLOAD_URL}`;
          const result = (await authClient.$fetch(uploadUrlEndpoint, {
            body: { contentType, filename },
            method: "POST",
          })) as { data?: { path: string; publicUrl: string; uploadUrl: string }; error?: { message?: string } };
          if (result.error || !result.data) {
            throw new Error(result.error?.message ?? "Failed to get upload URL");
          }
          const signed = result.data;
          const fileRes = await fetch(a.uri);
          const buffer = await fileRes.arrayBuffer();
          const uploadRes = await fetch(signed.uploadUrl, {
            body: buffer,
            headers: { "content-type": contentType },
            method: "PUT",
          });
          if (!uploadRes.ok) {
            throw new Error(`Upload failed (${uploadRes.status})`);
          }
          setPending((p) => p.filter((u) => u !== a.uri));
          currentPhotos = [
            ...currentPhotos,
            { id: a.assetId ?? signed.path, uri: signed.publicUrl },
          ].slice(0, MAX);
          set({ photos: currentPhotos });
        }
        set({ photos: currentPhotos.map((p, i) => ({ ...p, cover: i === 0 })) });
      } finally {
        setPending([]);
      }
    } catch (error) {
      toast.show(
        error instanceof Error ? error.message : "Could not open the camera",
        "error",
      );
    } finally {
      setLoading(false);
    }
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
          {pending.map((uri) => (
            <View className="relative items-center justify-center" key={uri} style={{ width: "30%", aspectRatio: 1 }}>
              <Image source={{ uri }} style={{ aspectRatio: 1, borderRadius: 12, width: "100%", opacity: 0.6 }} />
              <View className="absolute inset-0 items-center justify-center">
                <Skeleton className="size-10 rounded-pill" />
              </View>
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
