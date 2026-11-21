import { AreaLocationField } from "@features/listing/components/area-location-field";
import { ListingOptionGrid } from "@features/listing/components/listing-option-grid";
import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Chip } from "@wearly/ui-native/badge";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const CATEGORIES = [
  "Dresses",
  "Ethnic",
  "Jackets",
  "Sets",
  "Shirts",
  "Trousers",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Other"];
const CONDITIONS = [
  "Brand New with Tags",
  "Brand New without Tags",
  "Excellent",
  "Good",
  "Fair",
];

export default function DetailsScreen() {
  const router = useRouter();
  const { draft, set } = useListingDraft();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.title.trim()) {
      next.title = "Title is required";
    }
    if (!draft.areaLabel.trim()) {
      next.area = "Tell renters roughly where you are";
    }
    if (!draft.category) {
      next.category = "Category is required";
    }
    if (!draft.size) {
      next.size = "Size is required";
    }
    if (!draft.condition) {
      next.condition = "Condition is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validate()) {
      router.push("/list/price");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background pt-safe"
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        className="flex-1 px-gutter"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2 pt-4">
          <Text variant="headingLg">Clothing details</Text>
        </View>
        <View className="mt-4 gap-4">
          <TextField
            error={errors.title}
            label="Title"
            onChangeText={(v) => set({ title: v })}
            value={draft.title}
          />
          <AreaLocationField
            error={errors.area}
            hasLocation={draft.latitude !== null}
            onAreaChange={(v) => set({ areaLabel: v })}
            onLocation={(coords) =>
              set({ latitude: coords.latitude, longitude: coords.longitude })
            }
            value={draft.areaLabel}
          />
          <View className="gap-2">
            <Text variant="label">Category</Text>
            <ListingOptionGrid
              onSelect={(v) => set({ category: v })}
              options={CATEGORIES}
              selected={draft.category}
            />
            {errors.category ? (
              <Text tone="destructive" variant="caption">
                {errors.category}
              </Text>
            ) : null}
          </View>
          <TextField
            label="Subcategory (optional)"
            onChangeText={(v) => set({ subcategory: v })}
            value={draft.subcategory}
          />
          <View className="gap-2">
            <Text variant="label">Size</Text>
            <View className="flex-row flex-wrap gap-3">
              {SIZES.map((option) => (
                <Chip
                  key={option}
                  onPress={() => set({ size: option })}
                  selected={draft.size === option}
                >
                  {option}
                </Chip>
              ))}
            </View>
            {errors.size ? (
              <Text tone="destructive" variant="caption">
                {errors.size}
              </Text>
            ) : null}
          </View>
          <View className="gap-2">
            <Text variant="label">Condition</Text>
            <ListingOptionGrid
              onSelect={(v) => set({ condition: v })}
              options={CONDITIONS}
              selected={draft.condition}
            />
            {errors.condition ? (
              <Text tone="destructive" variant="caption">
                {errors.condition}
              </Text>
            ) : null}
          </View>
          <TextField
            label="Description"
            multiline
            onChangeText={(v) => set({ description: v })}
            value={draft.description}
          />
          <TextField
            label="Brand (optional)"
            onChangeText={(v) => set({ brand: v })}
            value={draft.brand}
          />
          <TextField
            label="Color (optional)"
            onChangeText={(v) => set({ color: v })}
            value={draft.color}
          />
          <TextField
            label="Material (optional)"
            onChangeText={(v) => set({ material: v })}
            value={draft.material}
          />
        </View>
      </ScrollView>
      <View className="px-gutter pt-2 pb-6">
        <Button onPress={goNext}>Continue</Button>
      </View>
    </KeyboardAvoidingView>
  );
}
