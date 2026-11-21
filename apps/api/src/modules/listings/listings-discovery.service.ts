import { Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { user } from "@wearly/db/schema/auth";
import { listings } from "@wearly/db/schema/listings";
import type {
  DiscoverListingsInput,
  DiscoverListingsResponse,
  DiscoveryListing,
  Listing,
} from "@wearly/shared/api/types";
import {
  distanceMeters,
  roundDistanceForDisplay,
} from "@wearly/shared/geo/distance";
import {
  type RankableListing,
  rankNearbyListings,
} from "@wearly/shared/geo/ranking";
import { addDaysToIsoDay, parseRupees } from "@wearly/shared/rentals/pricing";
import { and, desc, eq, gte, inArray, isNotNull, lte } from "drizzle-orm";
import { toListing } from "./listing-mapper.js";

const CANDIDATE_LIMIT = 200;
const METRES_PER_LATITUDE_DEGREE = 111_320;
/** Guards the day loop if a client sends an absurd window. */
const MAX_AVAILABILITY_DAYS = 120;

type Candidate = RankableListing & { base: Listing };

/**
 * Nearby discovery.
 *
 * Reads private coordinates only to compute a rounded distance; they never
 * reach the response. Ranking is delegated to the shared pure function so the
 * weights are tunable in one place and the mobile app could reuse them.
 */
@Injectable()
export class ListingsDiscoveryService {
  async discover(
    input: DiscoverListingsInput
  ): Promise<DiscoverListingsResponse> {
    const { latitude, longitude } = input;
    const hasLocation = latitude !== undefined && longitude !== undefined;
    const filters = [eq(listings.status, "published")];

    if (latitude !== undefined && longitude !== undefined) {
      const latitudeDelta = input.radiusMeters / METRES_PER_LATITUDE_DEGREE;
      const longitudeDelta =
        input.radiusMeters /
        (METRES_PER_LATITUDE_DEGREE *
          Math.max(0.01, Math.cos((latitude * Math.PI) / 180)));

      filters.push(
        isNotNull(listings.latitude),
        isNotNull(listings.longitude),
        gte(listings.latitude, latitude - latitudeDelta),
        lte(listings.latitude, latitude + latitudeDelta),
        gte(listings.longitude, longitude - longitudeDelta),
        lte(listings.longitude, longitude + longitudeDelta)
      );
    }
    if (input.categories?.length) {
      filters.push(inArray(listings.category, input.categories));
    }
    if (input.conditions?.length) {
      filters.push(inArray(listings.condition, input.conditions));
    }
    if (input.sizes?.length) {
      filters.push(inArray(listings.size, input.sizes));
    }

    const rows = await db
      .select({
        lenderImage: user.image,
        lenderName: user.name,
        listing: listings,
      })
      .from(listings)
      .leftJoin(user, eq(listings.lenderId, user.id))
      .where(and(...filters))
      .orderBy(desc(listings.createdAt))
      .limit(CANDIDATE_LIMIT);

    const candidates: Candidate[] = [];

    for (const { listing, lenderImage, lenderName } of rows) {
      const price = parseRupees(listing.pricePerDay);
      if (input.maxDailyRate && price > input.maxDailyRate) {
        continue;
      }

      const distance = distanceBetween(input, listing);
      if (distance !== null && hasLocation && distance > input.radiusMeters) {
        continue;
      }

      candidates.push({
        areaLabel: listing.areaLabel,
        availabilityScore: availabilityScore(
          listing.availability,
          input.availableFrom,
          input.availableTo
        ),
        base: toListing(listing, { image: lenderImage, name: lenderName }),
        brand: listing.brand,
        category: listing.category,
        createdAt: listing.createdAt.toISOString(),
        distanceMeters: distance,
        id: listing.id,
        pricePerDayRupees: price,
        title: listing.title,
      });
    }

    const ranked = rankNearbyListings(candidates, {
      maxPriceRupees: input.maxDailyRate,
      query: input.query,
    });

    const page = ranked.slice(input.offset, input.offset + input.limit);

    return {
      items: page.map(({ distanceBand, item }) => ({
        ...item.base,
        distanceBand: distanceBand?.label ?? null,
        distanceMeters:
          item.distanceMeters === null
            ? null
            : roundDistanceForDisplay(item.distanceMeters),
      })) satisfies DiscoveryListing[],
      limit: input.limit,
      offset: input.offset,
      radiusMeters: input.radiusMeters,
      total: ranked.length,
    };
  }
}

function distanceBetween(
  input: DiscoverListingsInput,
  listing: typeof listings.$inferSelect
): number | null {
  if (
    input.latitude === undefined ||
    input.longitude === undefined ||
    listing.latitude === null ||
    listing.longitude === null
  ) {
    return null;
  }
  return distanceMeters(
    { latitude: input.latitude, longitude: input.longitude },
    { latitude: listing.latitude, longitude: listing.longitude }
  );
}

/**
 * `null` means the renter did not ask for specific days, so availability is
 * neutral rather than favourable. A blocked day scores near zero instead of
 * hiding the listing: it may still be the right piece for another week.
 */
function availabilityScore(
  blockedDays: string[] | null,
  from: string | undefined,
  to: string | undefined
): number | null {
  if (!(from && to && blockedDays?.length)) {
    return from && to ? 1 : null;
  }

  const blocked = new Set(blockedDays);
  let day = from;

  for (let index = 0; index < MAX_AVAILABILITY_DAYS; index += 1) {
    if (blocked.has(day)) {
      return 0.05;
    }
    if (day >= to) {
      return 1;
    }
    day = addDaysToIsoDay(day, 1);
  }

  return 0.05;
}
