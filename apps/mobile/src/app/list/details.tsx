import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Button } from "@wearly/ui-native/button";
import { TextField } from "@wearly/ui-native/fields";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

const CATEGORIES = ["Dresses", "Ethnic", "Jackets", "Sets", "Shirts", "Trousers"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "Other"];
const CONDITIONS = ["Brand New with Tags", "Brand New without Tags", "Excellent", "Good", "Fair"];

export default function DetailsScreen() {
  const router = useRouter();
  const { draft, set } = useListingDraft();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!draft.title.trim()) e.title = "Title is required";
    if (!draft.category) e.category = "Category is required";
    if (!draft.size) e.size = "Size is required";
    if (!draft.condition) e.condition = "Condition is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate()) router.push("/list/price" as any);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-2 pt-6">
          <Text variant="headingLg">Clothing details</Text>
        </View>
        <View className="mt-4 gap-4">
          <TextField
            label="Title"
            onChangeText={(v) => set({ title: v })}
            value={draft.title}
            error={errors.title}
          />
          <ChipGroup label="Category" options={CATEGORIES} selected={draft.category} onSelect={(v) => set({ category: v })} error={errors.category} />
          <TextField
            label="Subcategory (optional)"
            onChangeText={(v) => set({ subcategory: v })}
            value={draft.subcategory}
          />
          <ChipGroup label="Size" options={SIZES} selected={draft.size} onSelect={(v) => set({ size: v })} error={errors.size} />
          <ChipGroup label="Condition" options={CONDITIONS} selected={draft.condition} onSelect={(v) => set({ condition: v })} error={errors.condition} />
          <TextField
            label="Description"
            multiline
            onChangeText={(v) => set({ description: v })}
            value={draft.description}
          />
          <TextField label="Brand (optional)" onChangeText={(v) => set({ brand: v })} value={draft.brand} />
          <TextField label="Color (optional)" onChangeText={(v) => set({ color: v })} value={draft.color} />
          <TextField label="Material (optional)" onChangeText={(v) => set({ material: v })} value={draft.material} />
        </View>
      </ScrollView>
      <View className="px-gutter pb-6">
        <Button onPress={next}>Continue</Button>
      </View>
    </View>
  );
}

function ChipGroup({
  error,
  label,
  onSelect,
  options,
  selected,
}: {
  error?: string;
  label: string;
  onSelect: (v: string) => void;
  options: string[];
  selected: string;
}) {
  return (
    <View className="gap-2">
      <Text variant="label">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => (
          <Button
            key={o}
            onPress={() => onSelect(o)}
            size="sm"
            variant={selected === o ? "primary" : "soft"}
          >
            {o}
          </Button>
        ))}
      </View>
      {error ? <Text tone="destructive" variant="caption">{error}</Text> : null}
    </View>
  );
}
