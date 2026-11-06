import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import type { Listing } from "@wearly/shared/api/types";
import { API_ROUTES } from "@wearly/shared/api/routes";
import { authClient } from "@/lib/auth-client";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Image, ScrollView, View } from "react-native";

export default function ReviewScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft } = useListingDraft();
  const cover = draft.photos.find((p) => p.cover) ?? draft.photos[0];
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const publish = async () => {
    setPublishing(true);
    setError("");
    try {
      const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
      const result = (await authClient.$fetch(`${apiBase}${API_ROUTES.LISTINGS.BASE}`, {
        body: {
          availability: draft.availability,
          brand: draft.brand || undefined,
          category: draft.category,
          color: draft.color || undefined,
          condition: draft.condition,
          description: draft.description || undefined,
          material: draft.material || undefined,
          photos: [...draft.photos]
             .sort((a, b) => (b.cover ? 1 : 0) - (a.cover ? 1 : 0))
             .map((p) => p.uri),
          pricePerDay: draft.pricePerDay,
          size: draft.size,
          status: "published",
          subcategory: draft.subcategory || undefined,
          title: draft.title,
        },
        method: "POST",
      })) as { data?: Listing; error?: { message?: string } };
      if (result.error || !result.data) {
        throw new Error(result.error?.message ?? "Failed to publish");
      }
      await queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      await queryClient.invalidateQueries({ queryKey: ["public-listings"] });
      router.push({ params: { id: result.data.id }, pathname: "/list/published" } as any);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-2 pt-4">
          <Text variant="headingLg">Review listing</Text>
        </View>
        {cover ? <Image source={{ uri: cover.uri }} style={{ height: 200, borderRadius: 16, marginTop: 12 }} /> : null}
        <View className="mt-4 gap-2">
          <Text variant="headingMd">{draft.title}</Text>
          <Text tone="muted-foreground" variant="bodySm">{draft.category} · {draft.size} · {draft.condition}</Text>
          <Text variant="bodyMd">{draft.description}</Text>
          <Text variant="bodyMd">₹{draft.pricePerDay}/day</Text>
        </View>
        {error ? <Text tone="destructive" variant="caption">{error}</Text> : null}
      </ScrollView>
      <View className="px-gutter pb-6 pt-2">
        <Button disabled={publishing} onPress={publish}>
          {publishing ? "Publishing..." : "Publish listing"}
        </Button>
      </View>
    </View>
  );
}
