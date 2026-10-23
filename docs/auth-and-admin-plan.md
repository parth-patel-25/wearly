# Auth + Admin Panel Implementation Plan (Supabase + Better Auth)

**Status:** Phase 0–5 done — live API smoke passed against Supabase; Google/Facebook OAuth and real email delivery still need credentials, mobile flow needs a device
**Created:** 2026-10-15
**Applies to:** `apps/api` (NestJS), `apps/web` (Next.js), `apps/mobile` (Expo), `packages/db` (new)

## Decisions (confirmed)

| Concern | Choice |
| --- | --- |
| DB | Supabase Postgres (hosting only) + Drizzle in `packages/db` |
| Auth | Better Auth mounted in NestJS at `/api/auth/*` (per `docs/auth-and-database.md`) |
| Methods | Email+password, Google OAuth, Facebook OAuth, 6-digit email verification via Resend |
| Clients | Web + Mobile (web also hosts the admin panel) |
| Roles | `user` → `admin` → `super_admin` (custom access control on Better Auth admin plugin) |
| Super-admin | Seeded directly in DB (parthpatelaa19@gmail.com); can email-invite / revoke other admins |
| Soft delete | Sets `deleted_at`, revokes sessions, blocks re-login, visible in admin with Restore |
| Hard delete | Permanent — removes auth account + row (Better Auth `removeUser`) |

> The seed password was shared in chat — it must be changed immediately after first login.

## Architecture

    apps/web (Next.js)  ──┐
    apps/mobile (Expo)  ──┼──▶ apps/api (NestJS)
                           │      /api/auth/*   ← Better Auth (email, Google, Facebook, verification)
                           │      /api/admin/*  ← our controllers (users, soft/hard delete, invites)
                           │      guards: session (global) + roles (admin | super_admin)
                           └──▶ Supabase Postgres via packages/db (drizzle)

## Key design points

- **Soft-delete enforcement**: Better Auth `databaseHooks.session.create.before` returns `false`
  when `user.deleted_at` is set → blocks login for email and OAuth. Soft-delete also calls
  `revokeUserSessions`. Admin controllers reject deleted users; a NestJS guard re-checks
  `deleted_at` on every `/api/admin/*` call.
- **Roles**: admin plugin with `createAccessControl` — `admin` (list users, soft/hard delete,
  restore non-admins), `super_admin` (everything + `set-role`, invites). Super-admins are
  protected from deletion/demotion by controller policy checks.
- **True email invites**: custom `admin_invites` table (hashed single-use token, 7-day expiry,
  bound to email). Super-admin enters email → Resend email with link → `/admin/invite/:token`
  → invitee signs up/in (redirect preserved) → accept verifies `session.user.email ===
  invite.email` → `setRole("admin")`.
- **Admin surface is NestJS-owned** (`/api/admin/*` calling `auth.api.*` server-side), not the
  raw Better Auth `/admin/*` exposed to the browser (permissions doc §12.2).
- **Global AuthGuard gotcha** (decision doc §5): `HealthController` and `NotesController` get
  `@AllowAnonymous()` so the current prototype keeps working.

---

## Phase 0 — Documentation (first, repo rule)

- [x] Update `docs/auth-and-database.md` — Supabase-as-hosting choice, admin plugin, roles,
  soft delete, invites
- [x] Update `docs/SCREENS.md` — mark sign-in/sign-up wired; add admin screens
  (`/admin/users`, `/admin/invites`, `/admin/invite/:token`)
- [x] Update `README.md` roadmap section

## Phase 1 — `packages/db`

- [x] Create `packages/db` with drizzle-orm + postgres.js + drizzle-kit
- [x] Generate Better Auth schema (`auth generate`): user/session/account/verification +
  admin plugin `role`/`banned` columns
- [x] Add custom user field `deleted_at` (Better Auth `additionalFields`)
- [x] Add `admin_invites` table (id, email, role, token_hash, invited_by, expires_at,
  accepted_at, created_at)
- [x] Commit reviewable SQL migrations; add `db:generate` / `db:migrate` scripts

## Phase 2 — `apps/api` (auth server)

- [x] Add deps: `better-auth`, `@better-auth/expo`, `@thallesp/nestjs-better-auth`, `resend`
- [x] Create `src/auth.ts` — drizzle adapter, email+password, Google + Facebook social
  providers, emailVerification via Resend, admin plugin with custom roles
  (`admin`, `super_admin`), session hook blocking soft-deleted users, `trustedOrigins`
  (`wearly://`, web origin, dev `exp://`)
- [x] Mount `AuthModule.forRoot({ auth })`; `bodyParser: false` in `main.ts`
  (re-added by the integration for non-auth routes)
- [x] Annotate `HealthController` + `NotesController` with `@AllowAnonymous()`
- [x] Add `@Roles()` decorator + `RolesGuard` for admin endpoints
- [x] Create `src/admin/` module:
  - [x] `GET /api/admin/users` — search, pagination, `includeDeleted`
  - [x] `POST /api/admin/users/:id/soft-delete`
  - [x] `POST /api/admin/users/:id/restore`
  - [x] `DELETE /api/admin/users/:id` (hard delete via `auth.api.removeUser`)
  - [x] `POST /api/admin/invites` (super-admin; sends Resend email)
  - [x] `GET /api/admin/invites` · `DELETE /api/admin/invites/:id`
  - [x] `GET /api/admin/invites/:token` (validate) · `POST /api/admin/invites/accept`
- [x] Resend email sender + templates (6-digit verification code, admin invite)
- [x] `scripts/seed-super-admin.ts` — reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from env,
  signs up / promotes to `super_admin` (never committed credentials)
- [x] Policy checks: super-admin protected from delete/demotion; only super-admin manages
  admins and invites

## Phase 3 — `apps/web` (sign-in/sign-up + admin panel)

- [x] Add deps: `better-auth`, `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner`,
  `@tanstack/react-query`; add `@features/*` path alias
- [x] `src/lib/auth-client.ts` + providers (QueryClient, sonner Toaster, session)
- [x] `src/features/auth/`:
  - [x] `/sign-in` page — zod schema in `validations/`, first-error toast + inline errors
  - [x] `/sign-up` page — same validation rules
  - [x] Google + Facebook buttons (`signIn.social`) with `?next=` redirect support
  - [x] `/verify-email` page — email-OTP code form (resend + verify)
- [x] `src/features/admin/`:
  - [x] `/admin` layout — soft sidebar, rose accent (DESIGN_SYSTEM §11)
  - [x] `/admin/users` — Table, search, pagination, include-deleted toggle, role/status
    badges, row actions with confirmation Dialog for soft/hard delete, restore
  - [x] `/admin/invites` — invite-by-email form, pending list, revoke (super-admin only)
  - [x] `/admin/invite/:token` — landing/accept flow (handles sign-up/sign-in redirect)
- [x] `src/proxy.ts` (Next 16 middleware) — redirect unauthenticated `/admin/*` →
  `/sign-in?next=…`; role checked in admin layout

## Phase 4 — `apps/mobile` (real auth)

- [x] Add deps: `better-auth`, `@better-auth/expo`, `expo-secure-store`,
  `expo-web-browser`, `expo-linking`, `expo-constants`, `expo-network`
  (`expo-web-browser`/`expo-linking`/`expo-constants` were already present)
- [x] `src/lib/auth-client.ts` (expoClient + SecureStore); keep Metro
  `unstable_enablePackageExports` default (decision doc gotcha #2)
- [x] Wire `LoginForm` / `SignUpForm` / social buttons to real `authClient`
  (forms split into `login-form.tsx` / `sign-up-form.tsx`; `name` added to
  `SignUpSchema`; social pair is Google + Facebook — Apple removed, no server
  provider)
- [x] Replace fake `use-signin` + in-memory `SessionProvider` with real session
  (favourites etc. stay local state; `isAuthenticated`/`name` are derived from
  `authClient.useSession`)
- [x] Email verification via 6-digit OTP (`emailOTP` plugin,
  `overrideDefaultEmailVerification`) — sign-up pushes
  `/verify-email?email=`, which verifies the code and returns to sign-in. A
  code avoids the `localhost` link Gmail filters as spam and needs no deep
  link or `adb reverse`. Duplicate sign-ups also send a fresh code through
  `emailAndPassword.onExistingUserSignUp`, so retrying an email that already
  has an account still lands on a usable code screen.
- [x] Extend `createApiClient` in `packages/shared` with cookie/headers support
  — not needed this pass: no authenticated API calls from mobile (catalogue is
  local); revisit when a mobile screen calls `/api/*` as a user
- [x] Query layer — `@tanstack/react-query` + `src/core/providers/query-provider.tsx`
  with `refetchOnWindowFocus: true`, bridged to screen focus / `AppState` by
  `use-focus-refetch.ts` (mirrors the web's window-focus refetch; see README
  §Data fetching and refetch policy)
- [x] Focus refetch actually reaches the network — Better Auth gates the session
  refetch on its online manager, which seeds itself from `navigator.onLine` and
  finds nothing on React Native, so every focus event was caught and discarded
  (a user deleted from `/admin/users` still looked signed in on mobile Profile).
  `use-auth-online-state.ts` feeds it `expo-network`'s `isConnected` instead.

## Phase 5 — Verification

Automated gates:

- [x] `bun run typecheck` clean
- [x] `bun run lint` clean
- [x] `bun run build` clean

Live API smoke — run 2026-10-16 against the real Supabase DB (`.env` holds the
credentials; never committed). API started with `RESEND_API_KEY=` empty so
verification codes print to the console instead of bouncing off the Resend
sandbox.

- [x] Manual: sign-up → 6-digit code → sign-in. With no API key the code
  prints to the console; with Resend it arrives by email. Google/Facebook
  OAuth **not** exercised: no client secret / app credentials yet.
- [x] Manual: super-admin seed login → user list (`GET /api/admin/users` 200,
  seed row present)
- [x] Manual: soft delete → user blocked from sign-in (403 `This account has
  been deleted.`) → restore → sign-in works
- [x] Manual: hard delete — API level verified (session dies → 401, sign-in
  fails, row gone from list). Web confirmation-dialog UX still needs a UI pass.
- [x] Manual: invite new email → accept → account becomes admin (invite created
  → invitee signs up + verifies → `POST /api/admin/invites/accept` → role
  `admin` → can now list users)
- [x] Manual: non-admin receives 403 on `/api/admin/*`
- [x] Manual: revoked invite — token lookup reports `status: "revoked"`,
  accept → 409
- [x] Real Resend delivery — `patelsindustries.com` is verified in Resend and
  `EMAIL_FROM` is `Wearly <no-reply@patelsindustries.com>`. Verification mail
  carries a 6-digit code, not a `localhost` link, so Gmail no longer has a
  phishing-shaped URL to filter and no `adb reverse` is needed to verify.

Fixed during smoke testing:

- Soft-delete sign-in always returned the generic 401 backstop, never the
  intended 403: `internalAdapter.findUserByEmail` returns `{ user, accounts }`
  in better-auth 1.7, so `isDeleted` never saw `deletedAt`. Added `unwrapUser`
  (`apps/api/src/auth.ts`) and use it in both the sign-in hook and the
  session-create backstop.
- Invite accept 500'd: it used better-auth's permission-checked `setRole`,
  which correctly rejects a plain user elevating themselves. Accept now writes
  the role directly via Drizzle — the valid token + matching email is the
  authorization (`admin-invites.service.ts`).
- `invitedByEmail` was always null in the invite list: a `select().leftJoin`
  nullifies the whole joined table when its first selected column is null, and
  the `user` table's alphabetical column order starts with nullable
  `ban_expires`. The list query now projects `user.email` (NOT NULL)
  explicitly.

Prerequisites state:

- [x] `DATABASE_URL` — Supabase project → Connect → Session pooler URI (port 5432)
- [ ] Google OAuth client ID + secret — **ID known, secret still missing**;
      provider stays hidden until both are set
- [ ] Facebook App ID + secret (requires HTTPS redirect URI — may need
      tunnel/domain); not configured
- [x] `RESEND_API_KEY` + verified sender domain — `patelsindustries.com`
      verified; `EMAIL_FROM="Wearly <no-reply@patelsindustries.com>"`
- [x] `BETTER_AUTH_SECRET` (generated with `openssl rand -base64 32`)

### Resend sender runbook

1. Verify the sending domain in Resend (DKIM/SPF records plus a DMARC record)
   and wait for the dashboard status to read **Verified**.
2. Set `EMAIL_FROM` to an address on that domain — the shared
   `onboarding@resend.dev` sender only delivers to the Resend account owner.
3. Verification emails contain only a 6-digit code, so `BETTER_AUTH_URL` no
   longer needs to be publicly reachable to complete sign-up. It must still be
   correct for OAuth callbacks and invite links.
4. Restart the API after changing env values. The Resend message id is logged
   on send, which makes dashboard correlation easy.

## Risks / notes

- Facebook OAuth is the most friction-prone piece (HTTPS redirect requirement); code it but
  ship email+Google first if no HTTPS domain exists yet.
- Seed password from chat must be rotated immediately after first login.
- RLS not used — API is the only DB consumer; revisit if Supabase-direct clients appear.
- `packages/shared` stays ORM-free (decision doc gotcha #4).
