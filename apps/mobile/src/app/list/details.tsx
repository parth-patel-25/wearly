import { useListingDraft } from "@features/listing/providers/listing-draft-provider";
import { Button } from "@wearly/ui-native/button";
import { Chip } from "@wearly/ui-native/badge";
import { TextField } from "@wearly/ui-native/fields";
import { OptionGrid } from "@features/welcome/components/option-grid";
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
          <View className="gap-2">
            <Text variant="label">Category</Text>
            <OptionGrid
              onSelect={(v) => set({ category: v })}
              options={CATEGORIES}
              selected={draft.category || null}
            />
            {errors.category ? <Text tone="destructive" variant="caption">{errors.category}</Text> : null}
          </View>
          <TextField
            label="Subcategory (optional)"
            onChangeText={(v) => set({ subcategory: v })}
            value={draft.subcategory}
          />
          <View className="gap-2">
            <Text variant="label">Size</Text>
            <View className="flex-row flex-wrap gap-3">
              {SIZES.map((o) => (
                <Chip key={o} onPress={() => set({ size: o })} selected={draft.size === o}>
                  {o}
                </Chip>
              ))}
            </View>
            {errors.size ? <Text tone="destructive" variant="caption">{errors.size}</Text> : null}
          </View>
          <View className="gap-2">
            <Text variant="label">Condition</Text>
            <OptionGrid
              onSelect={(v) => set({ condition: v })}
              options={CONDITIONS}
              selected={draft.condition || null}
            />
            {errors.condition ? <Text tone="destructive" variant="caption">{errors.condition}</Text> : null}
          </View>
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


