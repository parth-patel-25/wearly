import { HERO_ICONS } from "../email-hero-icons.js";
import { otpEmailLayout } from "../email-layout.js";
import { EMAIL_OTP_EXPIRY_MINUTES, WEARLY_CONTEXT } from "../email-theme.js";

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
    heroIcon: `<img src="${HERO_ICONS["mail-open"]}" width="32" height="32" alt="" style="display:block" />`,
    subject: "Confirm your new Wearly email",
    subtitle: "Enter this code to confirm your new email address.",
    title: "Confirm your new email",
  },
  "email-verification": {
    action: "verify your email",
    body: "Enter this code where prompted to verify your email and finish setting up your account.",
    heroIcon: `<img src="${HERO_ICONS["mail-check"]}" width="32" height="32" alt="" style="display:block" />`,
    subject: "Your Wearly verification code",
    subtitle:
      "Enter this code to verify your email and finish setting up your Wearly account.",
    title: "Confirm your email",
  },
  "forget-password": {
    action: "reset your password",
    body: "Enter this code where prompted to choose a new password for your account.",
    heroIcon: `<img src="${HERO_ICONS["key-round"]}" width="32" height="32" alt="" style="display:block" />`,
    subject: "Reset your Wearly password",
    subtitle:
      "Enter this code to choose a new password for your Wearly account.",
    title: "Reset your password",
  },
  "sign-in": {
    action: "sign in",
    body: "Enter this code where prompted to sign in to your Wearly account.",
    heroIcon: `<img src="${HERO_ICONS["lock-keyhole"]}" width="32" height="32" alt="" style="display:block" />`,
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
