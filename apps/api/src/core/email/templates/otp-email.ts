import { renderLucideIcon } from "../email-icons.js";
import { otpEmailLayout } from "../email-layout.js";
import {
  EMAIL_OTP_EXPIRY_MINUTES,
  EMAIL_THEME,
  WEARLY_CONTEXT,
} from "../email-theme.js";

export type OtpType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

const OTP_COPY: Record<
  OtpType,
  {
    action: string;
    body: string;
    heroIcon: string;
    subject: string;
    subtitle: string;
    title: string;
  }
> = {
  "change-email": {
    action: "confirm your new email",
    body: "Enter this code where prompted to confirm your new email address.",
    heroIcon: renderLucideIcon("mail-open", 32, EMAIL_THEME.primary),
    subject: "Confirm your new Wearly email",
    subtitle: "Enter this code to confirm your new email address.",
    title: "Confirm your new email",
  },
  "email-verification": {
    action: "verify your email",
    body: "Enter this code where prompted to verify your email and finish setting up your account.",
    heroIcon: renderLucideIcon("mail-check", 32, EMAIL_THEME.primary),
    subject: "Your Wearly verification code",
    subtitle:
      "Enter this code to verify your email and finish setting up your Wearly account.",
    title: "Confirm your email",
  },
  "forget-password": {
    action: "reset your password",
    body: "Enter this code where prompted to choose a new password for your account.",
    heroIcon: renderLucideIcon("key-round", 32, EMAIL_THEME.primary),
    subject: "Reset your Wearly password",
    subtitle:
      "Enter this code to choose a new password for your Wearly account.",
    title: "Reset your password",
  },
  "sign-in": {
    action: "sign in",
    body: "Enter this code where prompted to sign in to your Wearly account.",
    heroIcon: renderLucideIcon("lock-keyhole", 32, EMAIL_THEME.primary),
    subject: "Your Wearly sign-in code",
    subtitle: "Enter this code to sign in to your Wearly account.",
    title: "Sign in to Wearly",
  },
};

export function otpEmail(
  type: OtpType,
  otp: string
): {
  html: string;
  subject: string;
  text: string;
} {
  const copy = OTP_COPY[type];
  const preheader = `Your Wearly code is ${otp}. It expires in ${EMAIL_OTP_EXPIRY_MINUTES} minutes.`;
  const html = otpEmailLayout({
    body: copy.body,
    heroIcon: copy.heroIcon,
    otp,
    preheader,
    subtitle: copy.subtitle,
    title: copy.title,
  });
  const text = `Use this code to ${copy.action}: ${otp}

The code expires in ${EMAIL_OTP_EXPIRY_MINUTES} minutes. If you did not request it, you can ignore this email.

${WEARLY_CONTEXT}`;
  return { html, subject: copy.subject, text };
}
