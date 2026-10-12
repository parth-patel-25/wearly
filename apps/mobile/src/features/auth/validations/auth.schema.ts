import { z } from "zod";

/**
 * Auth schemas.
 *
 * Context-aware rules: logging in only needs the credentials the user already
 * has, while signing up is where a password gets its strength requirements —
 * asking for uppercase, lowercase and a number on the login screen would be
 * asking people to prove a policy they set in the past.
 *
 * The confirm-password mismatch is pathed onto `confirmPassword` rather than
 * left at the root, so it surfaces as an inline field error *and* as the first
 * message in the failure toast instead of a shapeless root error.
 */

const EMAIL = z
  .string()
  .min(1, "Enter your email")
  .email("That does not look like an email");

const HAS_LOWER = /[a-z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_UPPER = /[A-Z]/;

export const LoginSchema = z.object({
  email: EMAIL,
  password: z.string().min(1, "Enter your password"),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SignUpSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirm your password"),
    email: EMAIL,
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(HAS_LOWER, "Add a lowercase letter")
      .regex(HAS_NUMBER, "Add a number")
      .regex(HAS_UPPER, "Add an uppercase letter"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof SignUpSchema>;
