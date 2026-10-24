# Deployment — Wearly

Production stack: Vercel (web) + Railway (API) + Supabase (Postgres) + EAS (Android preview). No Docker. Mobile talks directly to Railway; web proxies `/api/*` to Railway so the Better Auth session cookie stays on the web origin (no custom domain required).

## 0. Prerequisites

Accounts: GitHub, Vercel, Railway, Supabase, Expo, Resend. Local: Bun 1.3.14, Node >=22, `bunx eas-cli`, `railway`, `vercel`. Branch: latest work is on `dev`; `origin/main` is older — merge `dev` → `main` first or explicitly deploy `dev`.

Secrets to prepare: Supabase session pooler URI (port 5432), fresh `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `RESEND_API_KEY`, `EMAIL_FROM`, optional Google/Facebook OAuth IDs, `ADMIN_EMAIL`/`ADMIN_PASSWORD` (seed only).

## 1. Supabase

1. Create the project (or reuse). Copy the **Session pooler** URI, port `5432`, append `?sslmode=require`.
2. Apply migrations before the first API deploy:
   ```bash
   DATABASE_URL='postgresql://...:5432/postgres?sslmode=require' \
     bun run --cwd packages/db db:migrate
   ```
3. Verify tables: `user`, `session`, `account`, `verification`, `admin_invites`.
4. Enable PITR/backups.

## 2. Railway — API

Service: root directory = repo root. Build: `bun install --frozen-lockfile && bun run build --filter=@wearly/api...`. Start: `cd apps/api && node dist/main.js`. Health check: `/api/health`. Public networking on, HTTPS.

Env vars:
- `NODE_ENV=production`
- `DATABASE_URL` = Supabase session pooler URI
- `BETTER_AUTH_SECRET` = fresh 32-byte secret
- `BETTER_AUTH_URL` = `https://<web>.vercel.app`
- `WEB_ORIGIN` = `https://<web>.vercel.app`
- `RESEND_API_KEY`, `EMAIL_FROM`, optional `RESEND_REPLY_TO`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if Google is used
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` optional
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` for seeding only

Notes: `BETTER_AUTH_URL` points at the web origin because browser auth traffic is proxied through Vercel. `WEB_ORIGIN` drives CORS, trusted origins and invite links. Remove `ADMIN_PASSWORD` after seeding. If Railway's builder does not detect Bun, pin `BUN_VERSION=1.3.14`. Verify: `curl https://<api>.up.railway.app/api/health`.

## 3. Vercel — Web

Project: root directory `apps/web`, enable "include files outside root". Install: `cd ../.. && bun install --frozen-lockfile`. Build: `cd ../.. && bun run build --filter=@wearly/web...`. Output `.next`, Node 22.x.

Env vars (Production):
- `NEXT_PUBLIC_API_URL` = `https://<web>.vercel.app` (the web origin, NOT the API URL)
- `API_PROXY_URL` = `https://<api>.up.railway.app`

Why: the browser auth client calls `/api/*` on the web origin; the Next.js rewrite forwards to Railway; the cookie is set on the Vercel host, so `hasSessionCookie()` and the `/admin` gate work without a custom domain. Local dev is unaffected (`API_PROXY_URL` unset, `NEXT_PUBLIC_API_URL=http://localhost:4000`).

## 4. Seed the super admin

Fix the seed imports first (`apps/api/scripts/seed-super-admin.ts`), then:

```bash
railway run --service <api-service> \
  bun run --cwd apps/api db:seed:super-admin
```

Log in once, rotate `ADMIN_PASSWORD`, then remove it from Railway.

## 5. Android preview (EAS)

1. `cd apps/mobile && bunx eas-cli login`
2. `.easignore` excludes `.env`, so set EAS env vars directly:
   ```bash
   bunx eas-cli env:create --environment preview \
     --name EXPO_PUBLIC_API_URL \
     --value https://<api>.up.railway.app --visibility plaintext
   bunx eas-cli env:create --environment preview \
     --name EXPO_PUBLIC_GOOGLE_CLIENT_ID \
     --value <google web client id> --visibility plaintext
   ```
3. `bunx eas-cli build --platform android --profile preview` (APK, internal distribution).
4. For Google sign-in to work in the preview: register the EAS-managed keystore SHA-1 (from `bunx eas-cli credentials`) on the Google Cloud Android OAuth client for `com.parthpatel25.wearly`. The debug SHA-1 in the docs does not cover EAS builds.
5. `EXPO_PUBLIC_*` is baked at build time; changing the API URL requires a rebuild. No `expo-updates` config exists, so no OTA updates. Uninstall the old app before installing the preview APK (different signing key).

Mobile talks directly to Railway (not through Vercel); native has no same-origin requirement and stores the session in SecureStore.

## 6. Verification

- [ ] `GET https://<api>.up.railway.app/api/health` → 200
- [ ] `GET https://<web>.vercel.app/api/health` → 200 (via rewrite)
- [ ] Web sign-up → OTP email → verify → session cookie on the Vercel host
- [ ] `/admin` loads after sign-in, redirects to `/sign-in` when signed out
- [ ] Admin invite create/accept works; invite links use the web origin
- [ ] Android preview: sign-up/sign-in, session survives app restart
- [ ] No CORS/cookie/DB errors in Railway logs
- [ ] Supabase tables populated

If the proxied `Set-Cookie` misbehaves, the fallback is a custom domain later (`app.example.com` + `api.example.com`) with Better Auth `crossSubDomainCookies`, or serving the API inside the Vercel project.

## 7. Operations

- Apply DB migrations before each API deploy; never `db:push` in production.
- Keep Railway and Vercel env in sync with the deployed web URL.
- Rotating `BETTER_AUTH_SECRET` invalidates all sessions; use `BETTER_AUTH_SECRETS` for rollover.
- Rollback: Vercel instant rollback, Railway previous deployment. DB migrations are forward-only — back up first.
- Monitor `/api/health` externally.
EOF
echo "written"