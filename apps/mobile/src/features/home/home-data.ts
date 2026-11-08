import type { Piece } from "@shared/data/catalogue";
import type { IconName } from "@wearly/ui-native/icon";

/**
 * Home v3 static content.
 *
 * Everything here is presentation config, not business state: labels and the
 * hero story live outside components so rails stay data-driven and a future
 * API can replace the slices without redesigning the screen.
 */

export const HOME_CATEGORIES = [
  "✨ For You",
  "Dresses",
  "Tops",
  "Jackets",
  "Sets",
  "Accessories",
  "More",
] as const;

export interface Occasion {
  icon: IconName;
  label: string;
}

export const HOME_OCCASIONS: readonly Occasion[] = [
  { icon: "sparkles", label: "Wedding" },
  { icon: "heart", label: "Date Night" },
  { icon: "shirt", label: "Party" },
  { icon: "compass", label: "Vacation" },
  { icon: "bag", label: "Brunch" },
  { icon: "clock", label: "Work" },
  { icon: "camera", label: "Festival" },
];

export const HOME_HERO = {
  caption: "Trending This Week",
  cta: "Explore looks",
  subtitle: "Looks worth renting.",
  title: "Wedding Season",
} as const;

export function trendingPieces(pieces: readonly Piece[], count = 8): readonly Piece[] {
  return pieces.slice(0, count);
}

export function newPieces(pieces: readonly Piece[], count = 8): readonly Piece[] {
  return pieces.slice(-count).reverse();
}

export interface Look {
  bundle: string;
  id: string;
  name: string;
  pieceIds: readonly [string, string, string];
}

const LOOK_SEEDS = [
  { bundle: "Dress + Bag + Shoes", name: "Weekend Brunch" },
  { bundle: "Dress + Accessories", name: "Wedding Guest" },
  { bundle: "Set + Jacket + Bag", name: "Festival Edit" },
] as const;

export function homeLooks(pieces: readonly Piece[] = []): readonly Look[] {
  if (pieces.length === 0) return [];
  return LOOK_SEEDS.map((seed, index) => ({
    ...seed,
    id: `look-${index + 1}`,
    pieceIds: [
      pieces[index * 3]?.id ?? pieces[0]?.id ?? "",
      pieces[index * 3 + 1]?.id ?? pieces[1]?.id ?? "",
      pieces[index * 3 + 2]?.id ?? pieces[2]?.id ?? "",
    ] as const,
  }));
}
