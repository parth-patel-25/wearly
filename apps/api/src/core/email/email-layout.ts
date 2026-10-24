import { renderLucideIcon } from "./email-icons.js";
import { EMAIL_LOGO_DATA_URI } from "./email-logo.js";

import {
  EMAIL_CONTENT_PADDING,
  EMAIL_LOGO_HEIGHT,
  EMAIL_LOGO_WIDTH,
  EMAIL_MAX_WIDTH,
  EMAIL_OTP_BOX,
  EMAIL_OTP_DIGITS,
  EMAIL_OTP_EXPIRY_MINUTES,
  EMAIL_OUTER_PADDING,
  EMAIL_THEME,
  WEARLY_CONTEXT,
} from "./email-theme.js";

interface OtpEmailOptions {
  body: string;
  heroIcon: string;
  otp: string;
  preheader: string;
  subtitle: string;
  title: string;
}

const TRAILING_SLASH = /\/$/;

function assetBase(): string {
  return (
    process.env.EMAIL_ASSET_BASE_URL ||
    process.env.WEB_ORIGIN ||
    "http://localhost:3000"
  ).replace(TRAILING_SLASH, "");
}

function envOrFallback(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

function footerLinks(): { help: string; privacy: string; terms: string } {
  const base = assetBase();
  return {
    help: envOrFallback("EMAIL_HELP_URL", `${base}/help`),
    privacy: envOrFallback("EMAIL_PRIVACY_URL", `${base}/privacy`),
    terms: envOrFallback("EMAIL_TERMS_URL", `${base}/terms`),
  };
}

function socialLinks(): { instagram: string; website: string; x: string } {
  const base = assetBase();
  return {
    instagram: envOrFallback("EMAIL_INSTAGRAM_URL", base),
    website: envOrFallback("EMAIL_WEBSITE_URL", base),
    x: envOrFallback("EMAIL_X_URL", base),
  };
}

function renderOtpBoxes(otp: string): string {
  const digits = otp
    .padEnd(EMAIL_OTP_DIGITS, " ")
    .slice(0, EMAIL_OTP_DIGITS)
    .split("");
  return digits
    .map(
      (digit) => `<td style="padding:0 ${EMAIL_OTP_BOX.gap / 2}px">
        <div style="width:${EMAIL_OTP_BOX.width}px;height:${EMAIL_OTP_BOX.height}px;line-height:${EMAIL_OTP_BOX.height}px;text-align:center;font-size:${EMAIL_OTP_BOX.fontSize}px;font-weight:700;letter-spacing:0;background:${EMAIL_THEME.input};border:1px solid ${EMAIL_THEME.border};border-radius:${EMAIL_OTP_BOX.radius}px;color:${EMAIL_THEME.foreground};font-family:${EMAIL_THEME.fontStack}">${digit.trim()}</div>
      </td>`
    )
    .join("");
}

export function emailLayout(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${title}</title>
</head>
<body style="margin:0;padding:${EMAIL_OUTER_PADDING}px;background:${EMAIL_THEME.background};font-family:${EMAIL_THEME.fontStack};color:${EMAIL_THEME.foreground}">
  <div style="max-width:${EMAIL_MAX_WIDTH}px;margin:0 auto;background:${EMAIL_THEME.card};border:1px solid ${EMAIL_THEME.border};border-radius:24px;overflow:hidden">
    <div style="padding:${EMAIL_CONTENT_PADDING}px">
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:500;line-height:1.3;color:${EMAIL_THEME.foreground}">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:${EMAIL_THEME.mutedForeground}">${body}</div>
      <p style="margin:24px 0 0;font-size:12px;color:${EMAIL_THEME.mutedForeground}">\u2014 Wearly</p>
    </div>
  </div>
</body>
</html>`;
}

export function otpEmailLayout(options: OtpEmailOptions): string {
  const { body, heroIcon, otp, preheader, subtitle, title } = options;
  const logoUrl = EMAIL_LOGO_DATA_URI;
  const links = footerLinks();
  const social = socialLinks();
  const support = process.env.EMAIL_SUPPORT_ADDRESS?.trim();
  const supportHref = support ? `mailto:${support}` : links.help;
  const supportLabel = support ? support : "Help center";

  const hero = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${EMAIL_THEME.accentWash};border-radius:16px;margin:0 0 24px">
    <tr><td align="center" style="padding:28px 0">
      <div style="width:72px;height:72px;line-height:72px;text-align:center;background:${EMAIL_THEME.card};border-radius:9999px;display:inline-block">${heroIcon}</div>
    </td></tr>
  </table>`;

  const otpRow = `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px">
    <tr>${renderOtpBoxes(otp)}</tr>
  </table>`;

  const contextBlock = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${EMAIL_THEME.secondaryFill};border-radius:16px;margin:20px 0 0">
    <tr><td style="padding:16px 18px">
      <p style="margin:0 0 6px;font-size:12px;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:${EMAIL_THEME.mutedForeground}">About Wearly</p>
      <p style="margin:0;font-size:13px;line-height:1.55;color:${EMAIL_THEME.foreground}">${WEARLY_CONTEXT}</p>
    </td></tr>
  </table>`;

  const socialRow = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px">
    <tr>
      <td style="padding:0 8px"><a href="${social.instagram}" style="text-decoration:none">${renderSocialIcon("at-sign", EMAIL_THEME.mutedForeground)}</a></td>
      <td style="padding:0 8px"><a href="${social.x}" style="text-decoration:none">${renderSocialIcon("x", EMAIL_THEME.mutedForeground)}</a></td>
      <td style="padding:0 8px"><a href="${social.website}" style="text-decoration:none">${renderSocialIcon("globe", EMAIL_THEME.mutedForeground)}</a></td>
      <td style="padding:0 8px"><a href="${supportHref}" style="text-decoration:none">${renderSocialIcon("mail", EMAIL_THEME.mutedForeground)}</a></td>
    </tr>
  </table>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${title}</title>
<style>
  @media (max-width: 480px) {
    .email-outer { padding: 16px !important; }
    .email-card { border-radius: 20px !important; }
    .email-content { padding: 24px !important; }
  }
</style>
</head>
<body style="margin:0;padding:${EMAIL_OUTER_PADDING}px;background:${EMAIL_THEME.background};font-family:${EMAIL_THEME.fontStack};color:${EMAIL_THEME.foreground}" class="email-outer">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
  <div style="max-width:${EMAIL_MAX_WIDTH}px;margin:0 auto;background:${EMAIL_THEME.card};border:1px solid ${EMAIL_THEME.border};border-radius:24px;overflow:hidden" class="email-card">
    <div style="padding:${EMAIL_CONTENT_PADDING}px" class="email-content">
      <div style="text-align:center;margin:0 0 20px">
        <img src="${logoUrl}" width="${EMAIL_LOGO_WIDTH}" height="${EMAIL_LOGO_HEIGHT}" alt="Wearly" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none" />
      </div>
      ${hero}
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:500;line-height:1.25;color:${EMAIL_THEME.foreground};text-align:center">${title}</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${EMAIL_THEME.mutedForeground};text-align:center">${subtitle}</p>
      ${otpRow}
      <p style="margin:0 0 4px;font-size:13px;color:${EMAIL_THEME.mutedForeground};text-align:center">
        <span style="display:inline-block;vertical-align:middle;margin-right:6px">${renderLucideIcon("clock", 14, EMAIL_THEME.mutedForeground)}</span>
        This code expires in ${EMAIL_OTP_EXPIRY_MINUTES} minutes.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${EMAIL_THEME.secondaryFill};border-radius:12px;margin:16px 0 0">
        <tr><td style="padding:12px 16px">
          <p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_THEME.foreground}">
            <span style="display:inline-block;vertical-align:middle;margin-right:6px">${renderLucideIcon("shield-check", 14, EMAIL_THEME.primary)}</span>
            If you didn\u2019t request this, you can ignore this email. Your account stays secure.
          </p>
        </td></tr>
      </table>
      ${contextBlock}
      <p style="margin:24px 0 0;font-size:12px;color:${EMAIL_THEME.mutedForeground};text-align:center">${body}</p>
    </div>
    <div style="padding:20px 24px 24px;border-top:1px solid ${EMAIL_THEME.border};text-align:center">
      ${socialRow}
      <p style="margin:0 0 8px;font-size:12px;color:${EMAIL_THEME.mutedForeground}">
        <a href="${links.privacy}" style="color:${EMAIL_THEME.mutedForeground};text-decoration:none">Privacy</a>
        &nbsp;\u00b7&nbsp;
        <a href="${links.terms}" style="color:${EMAIL_THEME.mutedForeground};text-decoration:none">Terms</a>
        &nbsp;\u00b7&nbsp;
        <a href="${links.help}" style="color:${EMAIL_THEME.mutedForeground};text-decoration:none">${supportLabel}</a>
      </p>
      <p style="margin:0 0 8px;font-size:12px;color:${EMAIL_THEME.mutedForeground}">Wearly \u00b7 Clothing rental marketplace</p>
      <p style="margin:0;font-size:11px;color:${EMAIL_THEME.mutedForeground}">\u00a9 ${new Date().getFullYear()} Wearly. You received this email because you have a Wearly account.</p>
    </div>
  </div>
</body>
</html>`;
}

function renderSocialIcon(name: string, color: string): string {
  return renderLucideIcon(name, 16, color);
}
