import { z } from "zod";

/**
 * Rental schemas.
 *
 * Every input in the rental flow is validated here rather than inline, and the
 * types come from the schemas so the two can never drift. The date rules are
 * the interesting part: a rental has to be a real, complete, non-negative range
 * on days the lender actually has free, and "which piece" has to exist.
 */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export const RentalRangeSchema = z
  .object({
    end: z.string().regex(ISO_DAY, "Pick a return day").nullable(),
    start: z.string().regex(ISO_DAY, "Pick a start day").nullable(),
  })
  .refine((range) => range.start !== null, { message: "Pick a start day" })
  .refine((range) => range.end !== null, { message: "Now pick a return day" })
  .refine(
    (range) =>
      range.start !== null && range.end !== null
        ? range.end >= range.start
        : true,
    {
      message: "The return day cannot be before the start day",
    }
  );

export type RentalRange = z.infer<typeof RentalRangeSchema>;

export const FULFILLMENT_OPTIONS = ["delivery", "pickup"] as const;

/** The option itself, not an object wrapping it — that is what a chip toggles. */
export type Fulfillment = (typeof FULFILLMENT_OPTIONS)[number];

export const FulfillmentSchema = z.object({
  method: z.enum(FULFILLMENT_OPTIONS),
});

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, "Enter your email")
    .email("That does not look like an email"),
  name: z
    .string()
    .min(1, "Tell us what to call you")
    .max(40, "That name is a little long"),
});

export type SignInInput = z.infer<typeof SignInSchema>;

/** Inclusive night count between two ISO days. A same-day rental is 1 day. */
export function countDays(start: string, end: string): number {
  const from = Date.parse(`${start}T00:00:00`);
  const to = Date.parse(`${end}T00:00:00`);
  return Math.round((to - from) / 86_400_000) + 1;
}
