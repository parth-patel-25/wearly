import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { user } from "@wearly/db/schema/auth";
import { listings } from "@wearly/db/schema/listings";
import type { CreateListingInput, Listing } from "@wearly/shared/api/types";
import { SUPPORTED_FULFILLMENT_METHODS } from "@wearly/shared/enums";
import { eq } from "drizzle-orm";
import { toListing } from "./listing-mapper.js";

@Injectable()
export class ListingsService {
  async create(lenderId: string, input: CreateListingInput): Promise<Listing> {
    const [row] = await db
      .insert(listings)
      .values({
        areaLabel: input.areaLabel,
        availability: input.availability ?? [],
        brand: input.brand,
        category: input.category,
        color: input.color,
        condition: input.condition,
        description: input.description,
        fulfillmentMethods: input.fulfillmentMethods ?? [
          ...SUPPORTED_FULFILLMENT_METHODS,
        ],
        latitude: input.latitude,
        lenderId,
        longitude: input.longitude,
        material: input.material,
        photos: input.photos ?? [],
        pricePerDay: input.pricePerDay,
        size: input.size,
        status: input.status ?? "draft",
        subcategory: input.subcategory,
        title: input.title,
      })
      .returning();

    if (!row) {
      throw new InternalServerErrorException("Listing could not be created");
    }

    return toListing(row);
  }

  async listByLender(lenderId: string): Promise<Listing[]> {
    const rows = await db
      .select()
      .from(listings)
      .where(eq(listings.lenderId, lenderId));
    return rows.map((row) => toListing(row));
  }

  async listPublished(): Promise<Listing[]> {
    const rows = await db
      .select({
        lenderImage: user.image,
        lenderName: user.name,
        listing: listings,
      })
      .from(listings)
      .leftJoin(user, eq(listings.lenderId, user.id))
      .where(eq(listings.status, "published"));
    return rows.map(({ listing, lenderImage, lenderName }) =>
      toListing(listing, { image: lenderImage, name: lenderName })
    );
  }

  async get(id: string): Promise<Listing | null> {
    const [row] = await db
      .select({
        lenderImage: user.image,
        lenderName: user.name,
        listing: listings,
      })
      .from(listings)
      .leftJoin(user, eq(listings.lenderId, user.id))
      .where(eq(listings.id, id))
      .limit(1);
    return row
      ? toListing(row.listing, { image: row.lenderImage, name: row.lenderName })
      : null;
  }
}
