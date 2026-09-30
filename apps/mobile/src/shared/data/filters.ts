import type { Category, Condition, Piece } from "./catalogue";
import { CONDITION_LABEL, isAvailable, sizeOf } from "./catalogue";

/**
 * Discovery filters.
 *
 * A filter set is a plain object with a count derived from it, so the sheet, the
 * applied-filter summary row and the results all read from the same thing. The
 * count is shown on the apply button rather than applied silently, because a
 * filter that changes the grid without saying so is the most frustrating thing a
 * catalogue can do.
 */

export interface Filters {
  categories: readonly Category[];
  conditions: readonly Condition[];
  /** ISO day the rental must be able to start on or after. */
  from: string | null;
  maxDailyRate: number | null;
  sizes: readonly string[];
}

export const NO_FILTERS: Filters = {
  categories: [],
  conditions: [],
  from: null,
  maxDailyRate: null,
  sizes: [],
};

export function activeFilterCount(filters: Filters): number {
  const byDate = filters.from === null ? 0 : 1;
  const byRate = filters.maxDailyRate === null ? 0 : 1;

  return (
    filters.categories.length +
    filters.conditions.length +
    filters.sizes.length +
    byDate +
    byRate
  );
}

export function applyFilters(
  pieces: readonly Piece[],
  filters: Filters
): Piece[] {
  return pieces.filter((piece) => {
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(piece.category)
    ) {
      return false;
    }
    if (
      filters.conditions.length > 0 &&
      !filters.conditions.includes(piece.condition)
    ) {
      return false;
    }
    if (filters.sizes.length > 0 && !filters.sizes.includes(sizeOf(piece))) {
      return false;
    }
    if (
      filters.maxDailyRate !== null &&
      piece.dailyRate > filters.maxDailyRate
    ) {
      return false;
    }
    if (filters.from !== null && !isAvailable(piece, filters.from)) {
      return false;
    }
    return true;
  });
}

/** Toggle a value in one of the list filters. Returns a new array. */
export function toggleIn<T>(list: readonly T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

/** Human labels for the condition filter, in the order the sheet shows them. */
export const CONDITION_OPTIONS: readonly Condition[] = Object.keys(
  CONDITION_LABEL
) as Condition[];
