import { expo } from "@better-auth/expo";
import { Logger } from "@nestjs/common";
import { db } from "@wearly/db/client";
import {
  account,
  accountRelations,
  session as authSession,
  user as authUser,
  sessionRelations,
  userRelations,
  verification,
} from "@wearly/db/schema/auth";
import { ROLES } from "@wearly/shared/enums";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { userAc } from "better-auth/plugins/admin/access";
import { isProduction } from "../config/env.js";
import { sendEmail } from "../email/email.js";
import { type OtpType, otpEmail } from "../email/templates/otp-email.js";
import { ac, adminRole, superAdminRole } from "./auth.roles.js";

const logger = new Logger("Auth");

type SocialProviders = NonNullable<BetterAuthOptions["socialProviders"]>;

const authSchema = {
  account,
  accountRelations,
  session: authSession,
  sessionRelations,
  user: authUser,
  userRelations,
  verification,
};

/**
 * Providers are only registered when their credentials exist in `.env`.
 *
 * Google registers on `GOOGLE_CLIENT_ID` alone: mobile signs in with the
 * native idToken flow, which Better Auth verifies against Google's JWKS
 * (audience = clientId) — no client secret involved. The secret is only
 * needed for a browser authorization-code flow.
 */
function buildSocialProviders(): SocialProviders {
  const providers: SocialProviders = {};
  const [googleClientId, googleClientSecret] = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  ];
  const f = [
    process.env.FACEBOOK_CLIENT_ID,
    process.env.FACEBOOK_CLIENT_SECRET,
  ];
  if (googleClientId) {
    if (googleClientSecret) {
      providers.google = {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      };
    } else {
      // Mobile idToken sign-in only needs the client id, but the browser
      // authorization-code flow calls `createAuthorizationURL`, which throws
      // CLIENT_ID_AND_SECRET_REQUIRED and surfaces as an opaque 500. Warn at
      // boot so a missing secret on the API host is never silent.
      logger.warn(
        "GOOGLE_CLIENT_ID is set but GOOGLE_CLIENT_SECRET is missing/empty: " +
          "native idToken sign-in will work, but browser Google sign-in " +
          "(/api/auth/sign-in/social) will fail with 500. Set " +
          "GOOGLE_CLIENT_SECRET on this API host and redeploy."
      );
      providers.google = { clientId: googleClientId };
    }
  }
  if (f[0] && f[1]) {
    providers.facebook = { clientId: f[0], clientSecret: f[1] };
  }
  return providers;
}

function trustedOrigins(): string[] {
  const origins = [
    "wearly://",
    process.env.WEB_ORIGIN ?? "http://localhost:3000",
  ];
  if (!isProduction()) {
    origins.push("exp://", "exp://**", "exp://192.168.*.*:*/**");
  }
  return origins;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDeleted(user: unknown): boolean {
  if (!isRecord(user)) {
    return false;
  }
  const { deletedAt } = user;
  return Boolean(deletedAt);
}

/**
 * `internalAdapter.findUserByEmail` returns `{ user, accounts }` while
 * `findUserById` returns the user with `accounts` beside its fields — accept
 * both shapes.
 */
function unwrapUser(record: unknown): unknown {
  if (!isRecord(record)) {
    return null;
  }
  if ("user" in record) {
    return record.user ?? null;
  }
  return record;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  databaseHooks: {
    session: {
      create: {
        // Backstop: never mint a session for a soft-deleted user (covers
        // OAuth callbacks and any path the before-hook above misses).
        before: async (session, ctx) => {
          if (!ctx) {
            return true;
          }
          const found = await ctx.context.internalAdapter.findUserById(
            session.userId
          );
          return !isDeleted(unwrapUser(found));
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // With `requireEmailVerification`, a duplicate sign-up deliberately returns
    // a generic success instead of `USER_ALREADY_EXISTS` (anti-enumeration).
    // That path skips the normal sign-up email, so the client would land on the
    // code screen with no code. Send a fresh OTP for the existing account too;
    // this keeps "swipe to sign up" working for accounts created earlier.
    async onExistingUserSignUp({ user }) {
      logger.log(
        `Existing account ${user.id} signed up again; sending verification OTP`
      );
      await auth.api.sendVerificationOTP({
        body: { email: user.email, type: "email-verification" },
      });
    },
    requireEmailVerification: true,
  },
  emailVerification: {
    // With the email-OTP override below, both hooks send a six-digit code
    // instead of a link. A code avoids the `localhost` URL that Gmail filters
    // as spam during local development and works on mobile without a deep
    // link. `sendOnSignIn` also gives an unverified account a fresh code when
    // it tries to sign in.
    sendOnSignIn: true,
    sendOnSignUp: true,
  },
  hooks: {
    // Clean error for soft-deleted users on password sign-in.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") {
        return;
      }
      const email = String(ctx.body?.email ?? "").toLowerCase();
      const found = await ctx.context.internalAdapter.findUserByEmail(email);
      if (isDeleted(unwrapUser(found))) {
        throw new APIError("FORBIDDEN", {
          message: "This account has been deleted.",
        });
      }
    }),
  },
  plugins: [
    expo(),
    admin({
      ac,
      adminRoles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
      defaultRole: ROLES.USER,
      roles: {
        [ROLES.ADMIN]: adminRole,
        [ROLES.SUPER_ADMIN]: superAdminRole,
        [ROLES.USER]: userAc,
      },
    }),
    emailOTP({
      allowedAttempts: 5,
      expiresIn: 600,
      otpLength: 6,
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        const copy = otpEmail(type as OtpType, otp);
        await sendEmail({ ...copy, to: email });
      },
      storeOTP: "hashed",
    }),
  ],
  socialProviders: buildSocialProviders(),
  trustedOrigins: trustedOrigins(),
  user: {
    additionalFields: {
      // Soft-delete marker: never accepted as user input, always returned.
      deletedAt: {
        fieldName: "deleted_at",
        input: false,
        required: false,
        returned: true,
        type: "date",
      },
    },
  },
});
