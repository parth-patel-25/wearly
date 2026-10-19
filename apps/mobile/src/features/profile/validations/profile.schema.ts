import { z } from "zod";

/**
 * Profile schemas.
 *
 * The display name is the only free-text field on Profile. It is deliberately
 * distinct from the email: the email is the auth identity and is changed
 * through a different, re-verification flow. The rule is context-aware — a
 * marketplace name is what a lender sees, so it is trimmed and bounded rather
 * than accepting a blank string or an essay.
 */

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;

export const DisplayNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(MIN_NAME_LENGTH, "Use at least 2 characters")
    .max(MAX_NAME_LENGTH, "Use at most 60 characters"),
});

export type DisplayNameInput = z.infer<typeof DisplayNameSchema>;
