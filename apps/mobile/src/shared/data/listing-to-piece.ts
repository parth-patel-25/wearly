import type { Listing } from "@wearly/shared/api/types";
import type { Condition } from "@wearly/shared/enums";
import type { Piece } from "./catalogue";

const TONES = [
  "accent",
  "info",
  "muted",
  "secondary",
  "success",
  "warning",
] as const;

/** A distance the API already rounded. Never inferred locally. */
export interface Proximity {
  band?: string | null;
  meters?: number | null;
}

/**
 * Legacy stored conditions to canonical values. Unrecognised input is null —
 * "not stated" — never a guessed condition, because a wrong badge label is
 * as misleading as an empty one. The canonical five translate to themselves;
 * the rest are the pre-migration vocabulary (web UI, listing form, seeds).
 */
const LEGACY_CONDITION: Readonly<Record<string, Condition>> = {
  brand_new_with_tags: "brand_new_with_tags",
  brand_new_without_tags: "brand_new_without_tags",
  excellent: "excellent",
  good: "good",
  fair: "fair",
  "Brand New with Tags": "brand_new_with_tags",
  "Brand New without Tags": "brand_new_without_tags",
  Good: "good",
  Excellent: "excellent",
  Fair: "fair",
  "good-condition": "good",
  "like-new": "brand_new_without_tags",
};

/** Displayable condition or null when the lender never said. */
export function normaliseCondition(raw: string): Condition | null {
  return LEGACY_CONDITION[raw] ?? null;
}

/**
 * Listing → piece.
 *
 * The listing contract has no coordinates, so there is nothing private to drop
 * here. A `Proximity` is only ever passed from a discovery result, which is the
 * one place the API computes a distance.
 */
export function listingToPiece(listing: Listing, proximity: Proximity = {}): Piece {
  const photos = (listing.photos ?? []).filter(Boolean);
  const images = photos.length ? photos : [""];
  const areaLabel = listing.areaLabel ?? "";

  return {
    areaLabel,
    availableFrom: new Date().toISOString().slice(0, 10),
    category: (listing.category as Piece["category"]) ?? "Dresses",
    condition: normaliseCondition(listing.condition),
    status: listing.status ?? "published",
    dailyRate: Number(listing.pricePerDay) || 0,
    deposit: 0,
    description: listing.description ?? "",
    distanceBand: proximity.band ?? null,
    gallery: images.map((_, i) => TONES[i % TONES.length] ?? "muted"),
    id: listing.id,
    images,
    lender: {
      image: listing.lenderImage ?? null,
      name: listing.lenderName ?? "Wearly member",
      neighbourhood: areaLabel,
      verified: false,
    },
    name: listing.title,
    size: listing.size ?? "",
    unavailable: listing.availability ?? [],
  };
}

/** "1.2 km away" for a detail screen; null when nothing was shared. */
export function distanceLabelOf(piece: Piece): string | null {
  if (piece.distanceBand) {
    return `${piece.distanceBand} away`;
  }
  return null;
}
