import { Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { listings } from "@wearly/db/schema/listings";
import type { CreateListingInput, Listing } from "@wearly/shared/api/types";
import { eq } from "drizzle-orm";

@Injectable()
export class ListingsService {
  async create(lenderId: string, input: CreateListingInput): Promise<Listing> {
    const [row] = await db
      .insert(listings)
      .values({
        availability: input.availability ?? [],
        brand: input.brand,
        category: input.category,
        color: input.color,
        condition: input.condition,
        description: input.description,
        lenderId,
        material: input.material,
        photos: input.photos ?? [],
        pricePerDay: input.pricePerDay,
        size: input.size,
        status: input.status ?? "draft",
        subcategory: input.subcategory,
        title: input.title,
      })
      .returning();

    return toListing(row!);
  }

  async listByLender(lenderId: string): Promise<Listing[]> {
    const rows = await db
      .select()
      .from(listings)
      .where(eq(listings.lenderId, lenderId));
    return rows.map(toListing);
  }

  async get(id: string): Promise<Listing | null> {
    const [row] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
    return row ? toListing(row) : null;
  }
}

function toListing(row: typeof listings.$inferSelect): Listing {
  return {
    availability: row.availability ?? [],
    brand: row.brand,
    category: row.category,
    color: row.color,
    condition: row.condition,
    createdAt: row.createdAt.toISOString(),
    description: row.description,
    id: row.id,
    lenderId: row.lenderId,
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
