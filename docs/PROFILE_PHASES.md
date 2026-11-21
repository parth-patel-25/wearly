# Profile — phase roadmap

Build tracker for the Profile experience in `apps/mobile`. The product intent
lives in `docs/WEARLY_UI_UX_SPEC.md` §7.10; this file tracks what is built, what
is blocked on missing infrastructure, and what is explicitly deferred.

A box is ticked only when the feature is implemented **and** supported by real
infrastructure. A feature that needs a marketplace backend is left unticked
rather than faked.

## Phase 1 — Implemented now

Supported by the current app (Better Auth session + local session state).

- [x] Profile identity — provider photo, initials fallback, name, email
      (`features/profile/components/profile-identity.tsx`, `@wearly/ui-native/avatar`)
- [x] Guest identity state with a sign-in CTA (`/sign-in`)
- [x] Editable display name via Better Auth `updateUser`
      (`features/profile/components/edit-name-sheet.tsx`, `hooks/use-update-name.ts`)
- [x] Profile photo — add/change/remove for every signed-in account, including
      email+password accounts that never got a provider image. Square-crop
      picker (gallery or camera), uploads through the signed-URL pipeline into
      the existing public Supabase bucket under an `avatars/` prefix, saved via
      Better Auth `updateUser({ image })`. Removal falls back to the monogram.
      (`features/profile/components/edit-photo-sheet.tsx`,
      `hooks/use-update-avatar.ts`, `shared/lib/upload-image.ts`,
      `POST /api/storage/upload-url` with `folder: "avatars"`)
- [x] Wishlist / saved pieces — preserved FlashList grid pipeline
      (`session.favourites → CATALOGUE.filter → useCatalogueGrid → ProductGrid`)
- [x] Settings + sign-out with confirmation and Better Auth `signOut`
      (`features/profile/components/profile-account.tsx`, `hooks/use-sign-out.ts`,
      `components/confirm-sheet.tsx`)
- [x] Help & support — honest information view; email action only when
      `EXPO_PUBLIC_SUPPORT_EMAIL` is configured
      (`features/profile/components/support-sheet.tsx`)
- [x] Privacy policy + terms — rendered only when `EXPO_PUBLIC_PRIVACY_URL` /
      `EXPO_PUBLIC_TERMS_URL` are configured; otherwise an honest note
      (`features/profile/components/profile-about.tsx`, `shared/constants/links.ts`)
- [x] App version from the installed Expo config
      (`shared/constants/app-info.ts`)
- [x] Profile completion reaches 100% — the always-false listing step was
      removed; only achievable steps count (`features/profile/profile-progress.ts`)

### Configuration still required

These destinations are **not** configured in this build. Add them to
`apps/mobile/.env` (documented in `.env.example`) to turn the corresponding rows
on. No placeholder is shown while they are unset.

- `EXPO_PUBLIC_SUPPORT_EMAIL` — support address.
- `EXPO_PUBLIC_PRIVACY_URL` — published privacy policy.
- `EXPO_PUBLIC_TERMS_URL` — published terms of service.

## Phase 2 — Waiting on the rental UI

The rental **backend foundation now exists** on `feat/p2p-in-person-rentals`:
shared enums/contracts, the rental state machine, DB tables (`rentals`,
`rental_events`, `meetup_proposals`, `disputes`) and a generated migration. What
is still missing is the API module and the mobile screens, so every box below
stays unticked — a destination is never shown with fake data.

- [ ] My rentals — requests, rental status, rental history and returns.
      Depends on: the `/api/rentals` endpoints and the rentals list screen.
- [ ] My listings — items lent and listing status.
      Depends on: listing creation/management (Phase 3 listing flow).
- [ ] Rental and return status.
      Depends on: the rental lifecycle endpoints (state machine already exists).
- [ ] Notifications — supported notification preferences.
      Depends on: notification settings storage + delivery infrastructure.
- [ ] Payment methods — payment-provider-backed methods.
      Depends on: a real payment provider; the interface and placeholder exist,
      but no money moves.

~~Delivery addresses~~ — **removed from scope.** Rentals are in person: the renter
and lender agree on a public place, and Wearly never stores a home address. If
delivery returns as a fulfilment method later, this row comes back with it.

Suggested order: My rentals → Rental/return status → My listings → Notifications
→ Payment methods. The first two share the rental lifecycle; listings depend on
the listing flow; payment and notifications depend on external providers.

## Phase 3 — Future marketplace capabilities

Explicitly deferred. Each needs its own data model, permissions, service logic
and UI when the relevant marketplace infrastructure is developed.

- [ ] Public profiles and reviews.
- [ ] Lender verification.
- [ ] Earnings and payout history.
- [ ] Cancellation and damage claims.
- [ ] Referral rewards and loyalty benefits.
