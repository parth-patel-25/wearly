import { Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { user } from "@wearly/db/schema/auth";
import { favourites } from "@wearly/db/schema/favourites";
import { listings } from "@wearly/db/schema/listings";
import type { FavouritesResponse, Listing } from "@wearly/shared/api/types";
import { and, desc, eq, inArray } from "drizzle-orm";
import { toListing } from "../listings/listing-mapper.js";

/**
 * Saved pieces. Every read and every write is scoped by `userId` — the lender:
 * the same `user` row `listings.lenderId` points at, so the account's saves are
 * exactly the pieces this lender favourited.
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
      .innerJoin(user, eq(user.id, favourites.userId))
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
   * Sign-in merge: union the guest's favourited ids into the lender's saves.
   * Only listings the lender still owns are accepted — the FK on `listingId`
   * would reject anything else, and a listing the lender unlisted is gone, not
   * merely unloved. Returns the full list afterwards, newest first.
   */
  async merge(
    userId: string,
    listingIds: string[]
  ): Promise<FavouritesResponse> {
    if (listingIds.length > 0) {
      const rows = await db
        .select({ id: listings.id, lenderId: listings.lenderId })
        .from(listings)
        .where(
          and(eq(listings.lenderId, userId), inArray(listings.id, listingIds))
        );
      if (rows.length > 0) {
        await db
          .insert(favourites)
          .values(
            rows.map(({ id, lenderId }) => ({
              listingId: id,
              userId: lenderId,
            }))
          )
          .onConflictDoNothing();
      }
    }
    return { items: await this.getByUser(userId) };
  }
}
