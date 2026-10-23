import { z } from "zod";

/**
 * Auth schemas.
 *
 * Context-aware rules: logging in only needs the credentials the user already
 * has, while signing up is where a password gets its strength requirements —
 * and the `name` field, which Better Auth requires on `signUpEmail`. Emails
 * are trimmed and lowercased before the format check so " Foo@Bar.com " and
 * "foo@bar.com" are one account, matching the web schemas.
 */

const EMAIL = z
  .string()
  .min(1, "Enter your email")
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.email("That does not look like an email"));

const HAS_LOWER = /[a-z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_UPPER = /[A-Z]/;

export const LoginSchema = z.object({
  email: EMAIL,
  password: z.string().min(1, "Enter your password"),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const VerifyCodeSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

export type VerifyCodeInput = z.infer<typeof VerifyCodeSchema>;

export const SignUpSchema = z
  .object({
    confirmPassword: z.string().min(1, "Confirm your password"),
    email: EMAIL,
    name: z
      .string()
      .min(1, "Enter your name")
      .max(80, "Use at most 80 characters"),
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
