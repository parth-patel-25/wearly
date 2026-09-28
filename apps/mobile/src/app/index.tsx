import { AppProviders } from "@wearly/ui-native/providers";
import { Screen } from "@wearly/ui-native/screen";
import { Text, View } from "react-native";

const swatches = [
  "bg-background",
  "bg-card",
  "bg-muted",
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-destructive",
] as const;

export default function HomeScreen() {
  return (
    <AppProviders>
      <Screen contentClassName="flex flex-col gap-6 p-4">
        <Text className="font-semibold text-2xl text-foreground">Wearly</Text>
        <Text className="text-muted-foreground text-sm">
          Turborepo · Expo · Uniwind · HeroUI Native
        </Text>

        <Text className="font-medium text-muted-foreground text-sm">
          Design tokens
        </Text>
        <ViewTokens />
      </Screen>
    </AppProviders>
  );
}

function ViewTokens() {
  return (
    <View className="flex flex-row flex-wrap gap-2">
      {swatches.map((swatch) => (
        <View
          className={`h-12 w-20 flex-row items-end rounded-md border border-border p-2 ${swatch}`}
          key={swatch}
        >
          <Text className="text-[10px] text-muted-foreground">
            {swatch.replace("bg-", "")}
          </Text>
        </View>
      ))}
    </View>
  );
}
