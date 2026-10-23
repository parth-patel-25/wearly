import { Logger } from "@nestjs/common";
import { Resend } from "resend";
import { isProduction } from "../config/env.js";

const logger = new Logger("Email");
const SANDBOX_SENDER_DOMAIN = "resend.dev";
const DEFAULT_FROM = "Wearly <onboarding@resend.dev>";

export interface SendEmailInput {
  html: string;
  subject: string;
  text: string;
  to: string;
}

let client: Resend | null | undefined;

function getClient(): Resend | null {
  if (client !== undefined) {
    return client;
  }
  const key = process.env.RESEND_API_KEY?.trim();
  client = key ? new Resend(key) : null;
  return client;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/**
 * Sends via Resend. Without `RESEND_API_KEY` (local dev before setup) the
 * message is printed so flows like email verification never silently lose
 * their code; in production a missing key is a hard failure.
 *
 * The sender must live on a domain verified in Resend. The shared
 * `onboarding@resend.dev` sender only reaches the Resend account owner's
 * inbox, so production refuses it rather than dropping mail for every other
 * recipient.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const resend = getClient();
  const from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
  const replyTo = process.env.RESEND_REPLY_TO?.trim();

  if (!resend) {
    const message = `RESEND_API_KEY not set — not sending "${input.subject}" to ${input.to}\n${input.text}`;
    if (isProduction()) {
      throw new Error(`Failed to send email to ${input.to}: ${message}`);
    }
    logger.warn(message);
    return;
  }

  if (isProduction() && from.includes(SANDBOX_SENDER_DOMAIN)) {
    throw new Error(
      `EMAIL_FROM (${from}) uses Resend's sandbox sender; verify a domain and use an address on it`
    );
  }

  const { data, error } = await resend.emails.send({
    from,
    html: input.html,
    replyTo,
    subject: input.subject,
    text: input.text,
    to: input.to,
  });

  if (error) {
    logger.error(
      `Failed to send "${input.subject}" to ${input.to}: ${error.message}`
    );
    throw new Error(`Failed to send email to ${input.to}: ${error.message}`);
  }

  logger.log(
    `Sent "${input.subject}" to ${input.to} (id: ${data?.id ?? "unknown"})`
  );
}

/** Minimal branded wrapper for Better Auth transactional emails. */
export function emailLayout(title: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#FFFBFC;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:480px;margin:0 auto;padding:32px;border-radius:16px;background:#FFFFFF">
      <h1 style="margin:0 0 16px;color:#111111;font-size:20px;line-height:1.3">${title}</h1>
      <div style="color:#444444;font-size:14px;line-height:1.6">${body}</div>
      <p style="margin:24px 0 0;color:#999999;font-size:12px">— Wearly</p>
    </div>
  </body>
</html>`;
}
