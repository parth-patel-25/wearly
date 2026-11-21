/**
 * Rental pricing.
 *
 * Pure and server-authoritative: the API snapshots these numbers onto the
 * rental so a later price change cannot rewrite a live booking. The mobile app
 * uses the same function for the review screen, so the number the renter sees
 * before sending is the number the API stores.
 */

/** Matches the cleaning line the product page already promises. */
export const CLEANING_FEE_PER_DAY_RUPEES = 25;

export const CURRENCY = "INR";

const DAY_MS = 86_400_000;

export interface RentalQuoteInput {
  cleaningFeePerDay?: number;
  endDate: string;
  pricePerDay: string | number;
  startDate: string;
}

export interface RentalQuote {
  cleaningFeeRupees: number;
  currency: string;
  days: number;
  pricePerDayRupees: number;
  rentalAmountRupees: number;
  totalRupees: number;
}

/** Whole rupees from the listing's text price. Invalid values become 0. */
export function parseRupees(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.round(parsed);
}

/** Inclusive day count. A same-day rental is one day. */
export function countRentalDays(startDate: string, endDate: string): number {
  const from = Date.parse(`${startDate}T00:00:00Z`);
  const to = Date.parse(`${endDate}T00:00:00Z`);
  if (!(Number.isFinite(from) && Number.isFinite(to)) || to < from) {
    return 0;
  }
  return Math.round((to - from) / DAY_MS) + 1;
}

/** `null` when the range is not a real, positive rental window. */
export function quoteRental({
  pricePerDay,
  startDate,
  endDate,
  cleaningFeePerDay = CLEANING_FEE_PER_DAY_RUPEES,
}: RentalQuoteInput): RentalQuote | null {
  const days = countRentalDays(startDate, endDate);
  const pricePerDayRupees = parseRupees(pricePerDay);

  if (days <= 0 || pricePerDayRupees <= 0) {
    return null;
  }

  const rentalAmountRupees = pricePerDayRupees * days;
  const cleaningFeeRupees = cleaningFeePerDay * days;

  return {
    cleaningFeeRupees,
    currency: CURRENCY,
    days,
    pricePerDayRupees,
    rentalAmountRupees,
    totalRupees: rentalAmountRupees + cleaningFeeRupees,
  };
}

/** Add days to an ISO day without dragging timezone offsets into the result. */
export function addDaysToIsoDay(day: string, days: number): string {
  const timestamp = Date.parse(`${day}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) {
    return day;
  }
  return new Date(timestamp + days * DAY_MS).toISOString().slice(0, 10);
}
