import { Skeleton } from "@wearly/ui-native/skeleton";
import { View } from "react-native";

/**
 * Loading placeholder for the product detail screen. Mirrors the hero photo and
 * the first lines of the content sheet so the transition from grid to detail
 * feels continuous instead of flashing the "not found" state while the fetch
 * resolves.
 */
export function ProductSkeleton() {
  return (
    <View className="flex-1 bg-background">
      {/* Hero photo placeholder — matches the 3:4 media block. */}
      <Skeleton className="w-full aspect-3/4 rounded-media" />

      {/* Content sheet — matches the rounded white sheet over the hero. */}
      <View className="flex flex-col gap-6 rounded-t-6xl bg-card px-gutter pt-8 pb-8">
        <View className="gap-2">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-pill" />
          <Skeleton className="h-7 w-16 rounded-pill" />
          <Skeleton className="h-7 w-24 rounded-pill" />
        </View>

        <View className="gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </View>

        <View className="gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </View>
      </View>
    </View>
  );
}