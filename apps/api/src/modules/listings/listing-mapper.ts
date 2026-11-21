import type { listings } from "@wearly/db/schema/listings";
import type { Listing } from "@wearly/shared/api/types";

/**
 * Row → public listing.
 *
 * Coordinates are intentionally dropped here. Every public read path goes
 * through this mapper, so a new endpoint cannot leak `latitude`/`longitude` by
 * spreading the row into a response.
 */
export interface ListingLender {
  image?: string | null;
  name?: string | null;
}

export function toListing(
  row: typeof listings.$inferSelect,
  lender: ListingLender = {}
): Listing {
  return {
    areaLabel: row.areaLabel,
    availability: row.availability ?? [],
    brand: row.brand,
    category: row.category,
    color: row.color,
    condition: row.condition,
    createdAt: row.createdAt.toISOString(),
    description: row.description,
    id: row.id,
    lenderId: row.lenderId,
    lenderImage: lender.image ?? null,
    lenderName: lender.name ?? null,
    material: row.material,
    photos: row.photos ?? [],
    pricePerDay: row.pricePerDay,
    size: row.size,
    status: row.status as Listing["status"],
    subcategory: row.subcategory,
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
  };
}
