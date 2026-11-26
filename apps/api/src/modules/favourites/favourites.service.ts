import { Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { user } from "@wearly/db/schema/auth";
import { favourites } from "@wearly/db/schema/favourites";
import { listings } from "@wearly/db/schema/listings";
import type { FavouritesResponse, Listing } from "@wearly/shared/api/types";
import { and, desc, eq, inArray } from "drizzle-orm";
import { toListing } from "../listings/listing-mapper.js";

/**
 * Saved pieces. Every read and every write is scoped by `userId` — the account
 * that saved the piece, not the listing's lender. You save other people's
 * pieces, so the row records who saved what.
 *
 * Saves are idempotent: the API accepts re-saving a piece and re-merging a
 * guest list, and `onConflictDoNothing` makes both safe to retry.
 */
@Injectable()
export class FavouritesService {
  async getByUser(userId: string): Promise<Listing[]> {
    const rows = await db
      .select({
        lenderImage: user.image,
        lenderName: user.name,
        listing: listings,
      })
      .from(favourites)
      .innerJoin(listings, eq(listings.id, favourites.listingId))
      .innerJoin(user, eq(user.id, listings.lenderId))
      .where(eq(favourites.userId, userId))
      .orderBy(desc(favourites.createdAt));
    return rows.map(({ lenderImage, lenderName, listing }) =>
      toListing(listing, { image: lenderImage, name: lenderName })
    );
  }

  async save(userId: string, listingId: string): Promise<void> {
    await db
      .insert(favourites)
      .values({ listingId, userId })
      .onConflictDoNothing();
  }

  async remove(userId: string, listingId: string): Promise<void> {
    await db
      .delete(favourites)
      .where(
        and(eq(favourites.userId, userId), eq(favourites.listingId, listingId))
      );
  }

  /**
   * Sign-in merge: union the guest's saved ids into the account. Any listing
   * that still exists is accepted — saving is about pieces you want, not
   * pieces you own — and the FK rejects ids that were deleted. Returns the
   * full list afterwards, newest first.
   */
  async merge(
    userId: string,
    listingIds: string[]
  ): Promise<FavouritesResponse> {
    if (listingIds.length > 0) {
      const rows = await db
        .select({ id: listings.id })
        .from(listings)
        .where(inArray(listings.id, listingIds));
      if (rows.length > 0) {
        await db
          .insert(favourites)
          .values(rows.map(({ id }) => ({ listingId: id, userId })))
          .onConflictDoNothing();
      }
    }
    return { items: await this.getByUser(userId) };
  }
}
