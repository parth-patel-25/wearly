import { Resend } from "resend";

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
  const key = process.env.RESEND_API_KEY;
  client = key ? new Resend(key) : null;
  return client;
}

export function isEmailConfigured(): boolean {
  return process.env.RESEND_API_KEY !== undefined;
}

/**
 * Sends via Resend. Without `RESEND_API_KEY` (local dev before setup) the
 * message is printed with `console.warn` so flows like email verification
 * never silently lose their link.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const resend = getClient();
  const from = process.env.EMAIL_FROM ?? "Wearly <onboarding@resend.dev>";

  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not set — not sending "${input.subject}" to ${input.to}\n${input.text}`
    );
    return;
  }

  const { error } = await resend.emails.send({
    from,
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: input.to,
  });

  if (error) {
    throw new Error(`Failed to send email to ${input.to}: ${error.message}`);
  }
}

/** Minimal branded wrapper for Better Auth transactional emails. */
export function emailLayout(title: string, body: string): string {
  return `<!doctype html><html><body style="font-family:sans-serif;background:#FFFBFC;padding:24px">
<h1 style="color:#111;font-size:18px">${title}</h1>
<p style="color:#444;font-size:14px;line-height:1.6">${body}</p>
<p style="color:#999;font-size:12px">— Wearly</p>
</body></html>`;
}
