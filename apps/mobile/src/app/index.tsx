import { AppProviders } from "@wearly/ui-native/providers";
import { Screen } from "@wearly/ui-native/screen";
import { Text, View } from "react-native";

/**
 * Proves the token layer resolves natively: every class below is the same name
 * the web showcase uses, resolving through the same `--wearly-*` variables.
 *
 * Flexbox only — no absolute positioning — so this scales across phones, tablets
 * and both platforms.
 */
const swatches = [
  "bg-background",
  "bg-card",
  "bg-muted",
  "bg-secondary",
  "bg-accent",
  "bg-primary",
  "bg-brand",
] as const;

const statuses = [
  "bg-success-background",
  "bg-warning-background",
  "bg-destructive-background",
  "bg-info-background",
] as const;

const radii = ["rounded-button", "rounded-card", "rounded-media"] as const;

export default function HomeScreen() {
  return (
    <AppProviders>
      <Screen contentClassName="flex flex-col gap-8 p-6">
        <View className="flex flex-col gap-1">
          <Text className="text-display text-foreground">Wearly</Text>
          <Text className="text-body-md text-muted-foreground">
            Same tokens as web · Expo · Uniwind · HeroUI Native
          </Text>
        </View>

        <View className="flex flex-col gap-3">
          <Text className="text-label text-muted-foreground">Colour</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {swatches.map((swatch) => (
              <View
                className={`h-14 w-20 flex-row items-end rounded-media border border-border p-2 ${swatch}`}
                key={swatch}
              >
                <Text className="text-caption text-muted-foreground">
                  {swatch.replace("bg-", "")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex flex-col gap-3">
          <Text className="text-label text-muted-foreground">Status</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {statuses.map((status) => (
              <View
                className={`h-14 flex-1 rounded-media border border-border p-2 ${status}`}
                key={status}
              >
                <Text className="text-caption text-foreground">
                  {status.replace("bg-", "").replace("-background", "")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex flex-col gap-3">
          <Text className="text-label text-muted-foreground">Radius</Text>
          <View className="flex flex-row flex-wrap gap-3">
            {radii.map((radius) => (
              <View
                className={`h-20 w-20 items-center justify-center border border-border bg-card ${radius}`}
                key={radius}
              >
                <Text className="text-caption text-muted-foreground">
                  {radius.replace("rounded-", "")}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex flex-col gap-3">
          <Text className="text-label text-muted-foreground">Type scale</Text>
          <View className="flex flex-col gap-2 rounded-card border border-border bg-card p-5">
            <Text className="text-foreground text-native-heading-lg">
              Heading
            </Text>
            <Text className="text-foreground text-native-body-md">
              Body copy sits at 15px with normal leading.
            </Text>
            <Text className="text-muted-foreground text-native-caption">
              Caption · metadata and timestamps
            </Text>
          </View>
        </View>
      </Screen>
    </AppProviders>
  );
}
