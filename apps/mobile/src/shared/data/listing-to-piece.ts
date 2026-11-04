import type { Listing } from "@wearly/shared/api/types";
import type { Piece } from "./catalogue";

const TONES = ["accent", "info", "muted", "secondary", "success", "warning"] as const;

export function listingToPiece(listing: Listing): Piece {
  const photos = listing.photos ?? [];
  const images = (
    photos.length >= 3
      ? [photos[0], photos[1], photos[2]]
      : [photos[0] ?? "", photos[1] ?? photos[0] ?? "", photos[2] ?? photos[0] ?? ""]
  ) as [string, string, string];

  return {
    availableFrom: new Date().toISOString().slice(0, 10),
    category: (listing.category as Piece["category"]) ?? "Dresses",
    condition: (listing.condition as Piece["condition"]) ?? "good-condition",
    dailyRate: Number(listing.pricePerDay) || 0,
    deposit: 0,
    description: listing.description ?? "",
    gallery: [TONES[0], TONES[2], TONES[4]],
    id: listing.id,
    images,
    lender: {
      name: listing.lenderName ?? "Lender",
      neighbourhood: "",
      verified: false,
    },
    name: listing.title,
    unavailable: listing.availability ?? [],
  };
}