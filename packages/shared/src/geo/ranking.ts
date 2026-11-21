import type { DistanceBand } from "./distance.js";
import { distanceBandFor } from "./distance.js";

/**
 * Nearby ranking.
 *
 * One pure function, one weight table. The API feeds it candidates from a
 * bounding-box query; screens never sort listings themselves. When ratings and
 * reliability data exist, their weights move from 0 without changing a caller.
 *
 * Distance is a score, not a filter: a listing at 1.2 km with the right dress
 * and an open date should beat a poorly matched one at 72 m.
 */

export interface RankingWeights {
  availability: number;
  distance: number;
  price: number;
  quality: number;
  rating: number;
  relevance: number;
}

export const RANKING_WEIGHTS: RankingWeights = {
  availability: 0.15,
  distance: 0.45,
  price: 0.1,
  quality: 0,
  rating: 0,
  relevance: 0.3,
};

/** Larger decay = distance matters less at short range. */
export const DISTANCE_DECAY_METERS = 800;

export interface RankableListing {
  areaLabel?: string | null;
  availabilityScore?: number | null;
  brand?: string | null;
  category: string;
  createdAt: string;
  distanceMeters: number | null;
  id: string;
  lenderRating?: number | null;
  pricePerDayRupees: number;
  qualityScore?: number | null;
  title: string;
}

export interface RankingContext {
  maxPriceRupees?: number | null;
  query?: string;
}

export interface RankedListing<T extends RankableListing> {
  distanceBand: DistanceBand | null;
  item: T;
  relevance: number;
  score: number;
}

const WHITESPACE = /\s+/;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function textRelevance(listing: RankableListing, query: string): number {
  const tokens = query.trim().toLowerCase().split(WHITESPACE).filter(Boolean);
  if (tokens.length === 0) {
    return 1;
  }

  const haystack = [
    listing.title,
    listing.category,
    listing.brand ?? "",
    listing.areaLabel ?? "",
  ]
    .join(" ")
    .toLowerCase();

  const matched = tokens.filter((token) => haystack.includes(token)).length;
  return matched / tokens.length;
}

function distanceScore(meters: number | null): number {
  if (meters === null) {
    // No location is still discoverable, but it should not outrank a nearby
    // listing on an otherwise equal match.
    return 0.25;
  }
  return 1 / (1 + Math.max(0, meters) / DISTANCE_DECAY_METERS);
}

function availabilityScore(value: number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0.6;
  }
  return clamp01(value);
}

function priceScore(
  priceRupees: number,
  maxPriceRupees: number | null | undefined
): number {
  if (!maxPriceRupees || maxPriceRupees <= 0) {
    return 0.5;
  }
  if (priceRupees <= maxPriceRupees) {
    return 1;
  }
  return clamp01(maxPriceRupees / priceRupees);
}

function ratingScore(rating: number | null | undefined): number {
  if (rating === null || rating === undefined) {
    return 0;
  }
  return clamp01(rating / 5);
}

function scoreOf(
  listing: RankableListing,
  context: RankingContext,
  relevance: number
): number {
  return (
    RANKING_WEIGHTS.distance * distanceScore(listing.distanceMeters) +
    RANKING_WEIGHTS.relevance * relevance +
    RANKING_WEIGHTS.availability *
      availabilityScore(listing.availabilityScore) +
    RANKING_WEIGHTS.price *
      priceScore(listing.pricePerDayRupees, context.maxPriceRupees) +
    RANKING_WEIGHTS.rating * ratingScore(listing.lenderRating) +
    RANKING_WEIGHTS.quality * clamp01(listing.qualityScore ?? 0)
  );
}

function timestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Ranks a candidate set without mutating it. Ties fall back to distance, then
 * to the newest listing, so equal scores stay stable and explainable.
 */
export function rankNearbyListings<T extends RankableListing>(
  listings: readonly T[],
  context: RankingContext = {}
): RankedListing<T>[] {
  const query = context.query ?? "";

  return listings
    .map((item) => {
      const relevance = textRelevance(item, query);
      return {
        distanceBand:
          item.distanceMeters === null
            ? null
            : distanceBandFor(item.distanceMeters),
        item,
        relevance,
        score: scoreOf(item, context, relevance),
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const aDistance = a.item.distanceMeters ?? Number.POSITIVE_INFINITY;
      const bDistance = b.item.distanceMeters ?? Number.POSITIVE_INFINITY;
      if (aDistance !== bDistance) {
        return aDistance - bDistance;
      }
      return timestamp(b.item.createdAt) - timestamp(a.item.createdAt);
    });
}
