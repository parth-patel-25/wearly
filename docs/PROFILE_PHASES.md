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

## Phase 2 — Blocked on rental infrastructure

None of these have a data model, service or API yet. They are listed so the
Profile destinations have a defined shape, and are **not** implemented with fake
data.

- [ ] My rentals — bookings, rental status, rental history and returns.
      Depends on: a rentals table, create/read endpoints, status transitions.
- [ ] My listings — items lent and listing status.
      Depends on: listing creation/management (Phase 3 listing flow).
- [ ] Rental and return status.
      Depends on: rental lifecycle states in the API.
- [ ] Delivery addresses — saved delivery details.
      Depends on: an address model + CRUD endpoints.
- [ ] Notifications — supported notification preferences.
      Depends on: notification settings storage + delivery infrastructure.
- [ ] Payment methods — payment-provider-backed methods.
      Depends on: a payment provider integration.

Suggested order once rental infrastructure exists: My rentals → Rental/return
status → Addresses → My listings → Notifications → Payment methods. The first
three share the rental lifecycle; listings depend on the listing flow; payment
and notifications depend on external providers.

## Phase 3 — Future marketplace capabilities

Explicitly deferred. Each needs its own data model, permissions, service logic
and UI when the relevant marketplace infrastructure is developed.

- [ ] Public profiles and reviews.
- [ ] Lender verification.
- [ ] Earnings and payout history.
- [ ] Cancellation and damage claims.
- [ ] Referral rewards and loyalty benefits.
