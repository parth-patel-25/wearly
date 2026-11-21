# Peer-to-peer in-person rentals — architecture

**Status:** Phase 2a — contracts, schema, API and mobile flow implemented; schema applied to Supabase (2026-11-19)
**Created:** 2026-11-18
**Applies to:** `apps/mobile` (Expo), `apps/api` (NestJS), `packages/shared`, `packages/db`
**Not in scope:** `apps/web` (landing + admin), delivery, real payment provider, deposits

Wearly is a peer-to-peer clothing rental marketplace. The renter and the lender
meet in person and exchange the piece. There is no delivery option in this
phase. The architecture is written so delivery can be added later as a new
fulfillment method, without rewriting the rental lifecycle.

---

## Principles

1. **The physical handover is a first-class event.** A rental never becomes
   `ACTIVE` because the lender accepted a request. It becomes active only after
   the renter confirms they have the piece.
2. **Payment is separate from rental status.** A rental can be confirmed before
   money moves. Payment has its own state machine and provider interface, so a
   provider can be connected without touching rental transitions.
3. **Distance is a ranking signal, not a hard filter.** Listings further away can
   outrank closer ones when they are a better match. Progressive radius bands
   are display groupings, never a search cut-off.
4. **Exact private locations never leave the server.** The API exposes an area
   label and a rounded distance. Coordinates are write-only.
5. **One authority per decision.** The API owns transitions and authorization.
   The mobile app renders capabilities the API computed; it never invents them.
6. **No fabricated marketplace facts.** No fake ratings, reviews, payouts or
   payment confirmations. The placeholder provider says so in the UI.

---

## What exists today (verified)

| Area | Current state |
| --- | --- |
| Mobile | Expo Router. Tabs: Home, Discover, List, Profile; Rentals is registered but hidden from the tab bar. `rent/dates`, `rent/checkout`, `rent/confirmed` are a UI prototype. |
| API | NestJS. Listings create/read, storage signed uploads, admin, notes, health. Better Auth at `/api/auth/*`. |
| Database | Drizzle + Supabase Postgres. `user`, `session`, `account`, `verification`, `admin_invites`, `listings`. |
| Rentals | No table, no service, no state. `SessionProvider.lastRental` stores one booking on the device. |
| Location | None. No coordinates, no `expo-location`, no distance code. |
| Payments | None. Checkout has a "Pay" button that only navigates. |
| Fulfillment | Checkout offers delivery and pickup with hardcoded fees; this phase removes delivery. |

Things that must not be extended:

- `session.lastRental` — replace with API-backed rentals.
- Delivery/pickup chips and the `DELIVERY_FEE` constant — remove.
- The prototype "Paid today" copy — replace with an honest request summary.

`listings.availability` means **blocked dates**, not open dates. The accept path
must treat it as "these days are unavailable".

---

## A. Renter journey

```text
Discover (optional location permission)
  → Nearby results, ranked; each card shows area + approximate distance
  → Product detail (in-person only, no delivery)
  → Choose dates
  → Review request (price, duration, meetup expectation)
  → Sign in only when the request needs an account
  → Send rental request        [provider authorizes payment]
  → Waiting for lender
  → Lender accepted
  → Propose a public meetup (or accept the lender's proposal)
  → Meetup scheduled
  → Check in at the meetup
  → Inspect the piece
  → Confirm receipt            [provider captures payment]
  → Rental active
  → Return by the due date
  → Mark returned
  → Lender confirms
  → Completed
```

At every step the detail screen answers three questions: what is happening, who
needs to act, and what happens next. The copy lives in the mobile feature, keyed
by status and role, so it can be reworded without touching the state machine.

---

## B. Lender journey

```text
List a piece
  → Add a private location + public area label (or type an area)
  → Publish
  → Request received: renter profile, piece, dates, duration, price
  → Accept / Decline
  → Propose or accept a public meetup
  → Meet, check in, hand over
  → Renter confirms receipt   [lender acknowledgement recorded, not blocking]
  → Payout becomes eligible   [future provider]
  → Renter returns the piece
  → Confirm return
  → Completed
```

A lender can cancel before activation. A decline or pre-meetup cancellation
voids the payment authorization. Repeated cancellations are recorded in
`rental_events` for a future reliability score; no score is displayed now.

---

## C. Rental state machine

The canonical implementation is
`packages/shared/src/rentals/state-machine.ts`. The API enforces it; the mobile
app uses it for labels and capabilities only.

### Statuses

```text
REQUESTED → ACCEPTED → MEETUP_PENDING → MEETUP_SCHEDULED → AT_MEETUP
→ HANDOVER_PENDING → ACTIVE → RETURN_PENDING → RETURNED → COMPLETED
```

Exception and terminal states:

```text
DECLINED  CANCELLED  EXPIRED  NO_SHOW  DISPUTED  PAYMENT_FAILED
```

| Status | Meaning | Next actor |
| --- | --- | --- |
| `REQUESTED` | Renter sent the request. Lender has 48 hours. | Lender |
| `ACCEPTED` | Lender accepted; no meetup proposed yet. | Either party |
| `MEETUP_PENDING` | One party proposed a place/time; the other must agree. | Other party |
| `MEETUP_SCHEDULED` | Both agreed on a public place and time. | Either party |
| `AT_MEETUP` | At least one party checked in. | Renter |
| `HANDOVER_PENDING` | Renter is inspecting the piece. | Renter |
| `ACTIVE` | Renter confirmed receipt; payment captured; rental clock started. | Renter |
| `RETURN_PENDING` | Return date reached. | Renter |
| `RETURNED` | Renter marked the piece returned. | Lender |
| `COMPLETED` | Lender confirmed; rental closed. | — |
| `DECLINED` | Lender declined. | — |
| `EXPIRED` | Lender did not respond within 48 hours. | — |
| `CANCELLED` | Cancelled before activation, with actor and reason. | — |
| `NO_SHOW` | One party reported the other absent. | Support |
| `DISPUTED` | Item mismatch, damage, non-handover or no-show dispute. | Support |
| `PAYMENT_FAILED` | Authorization or capture failed. | Renter |

### Transitions

| From | Action | To | Actor |
| --- | --- | --- | --- |
| — | `request` | `REQUESTED` | Renter |
| `REQUESTED` | `accept` | `ACCEPTED` | Lender |
| `REQUESTED` | `decline` | `DECLINED` | Lender |
| `REQUESTED` | `cancel` | `CANCELLED` | Renter |
| `REQUESTED` | `expire` | `EXPIRED` | System |
| `ACCEPTED` | `propose_meetup` | `MEETUP_PENDING` | Either |
| `MEETUP_PENDING` | `accept_meetup` | `MEETUP_SCHEDULED` | Other party |
| `MEETUP_PENDING` | `propose_meetup` | `MEETUP_PENDING` | Either (counter) |
| `MEETUP_SCHEDULED` | `propose_meetup` | `MEETUP_PENDING` | Either (reschedule) |
| `MEETUP_SCHEDULED` | `check_in` | `AT_MEETUP` | Either |
| `AT_MEETUP` | `start_inspection` | `HANDOVER_PENDING` | Renter |
| `AT_MEETUP` / `HANDOVER_PENDING` | `confirm_handover` | `ACTIVE` | Renter |
| `AT_MEETUP` / `HANDOVER_PENDING` | `report_issue` | `DISPUTED` | Renter |
| `MEETUP_SCHEDULED` / `AT_MEETUP` | `report_no_show` | `NO_SHOW` | Either |
| `REQUESTED` … `AT_MEETUP` | `cancel` | `CANCELLED` | Either |
| `ACTIVE` | `return_due` | `RETURN_PENDING` | System |
| `ACTIVE` / `RETURN_PENDING` | `mark_returned` | `RETURNED` | Renter |
| `RETURNED` | `confirm_return` | `COMPLETED` | Lender |
| `ACTIVE` … `RETURNED` | `open_dispute` | `DISPUTED` | Either |
| `REQUESTED` … `HANDOVER_PENDING` | payment failure | `PAYMENT_FAILED` | Provider/system |
| `PAYMENT_FAILED` | `retry_payment` | `REQUESTED` | Renter |
| `DISPUTED` | `resolve` | Prior / `COMPLETED` / `CANCELLED` | Admin (future) |

### Invariants

- `ACTIVE` is reachable only through `confirm_handover` by the renter.
- The lender can never confirm receipt on the renter's behalf.
- A rental in `DISPUTED` cannot capture or release money.
- Every transition writes a `rental_events` row in the same transaction.
- A transition is guarded by `UPDATE … WHERE id = ? AND status = ?`; concurrent
  callers receive `409`, not a second transition.
- Price, duration and fees are snapshotted on the rental at request time.
- The renter and lender must be different users.
- Only the renter or lender of a rental may read or act on it.

### Return timing

`start_date` and `end_date` describe the intended rental window. The actual
return deadline is `activated_at + rental days`, so a meetup that happens later
than the chosen start date does not silently shorten the rental. Overlap checks
use the intended window; a future phase can move to actual windows once
rescheduling is supported.

---

## D. Payment flow

```text
Request created        → authorize (hold funds)     → AUTHORIZED
Lender accepts         → no capture                 → AUTHORIZED
Decline / expire /
cancel before meetup   → void authorization         → VOIDED
Renter confirms
handover               → capture                    → CAPTURED
Return completed       → payout (future)            → PAID_OUT
Dispute                → hold / refund per policy   → REFUNDED or HELD
```

Payment state is stored separately from rental status:

```text
NOT_STARTED → AUTHORIZING → AUTHORIZED → CAPTURE_PENDING → CAPTURED
                    ↘ FAILED        ↘ FAILED      ↘ VOIDED
```

In placeholder mode the status is `PLACEHOLDER` and never moves: no
authorization exists, so there is nothing to capture or void. The UI reads the
mode and says that no money was taken or reserved.

### Provider abstraction

`apps/api/src/core/payments/payment-provider.ts` defines:

```ts
interface PaymentProvider {
  authorize(input: AuthorizeInput): Promise<AuthorizationResult>;
  capture(input: CaptureInput): Promise<CaptureResult>;
  void(input: VoidInput): Promise<void>;
  refund(input: RefundInput): Promise<void>; // future
  payout(input: PayoutInput): Promise<void>; // future
}
```

The current implementation is a placeholder. It records `provider: null` and
never claims money was taken. The mobile UI uses that to show:

> Payment protection is not connected in this build. No money has been taken or
> reserved.

The rental state machine is identical when a real provider is connected. A
provider implementation must be idempotent per rental transition; the capture
call uses the rental id as its idempotency key.

### Failure handling

| Failure | Result |
| --- | --- |
| Authorization fails at request | `PAYMENT_FAILED`; no request is sent; renter can retry. |
| Capture fails at handover | `PAYMENT_FAILED`; rental does **not** activate. The piece is physically with the renter, so the case goes to support/dispute; the app never pretends the rental is active. |
| Provider timeout | Transition is retried with the same idempotency key; the rental stays in its previous state until the provider confirms. |
| Dispute before capture | No capture. Funds remain held or are voided per policy. |
| Refund after activation | Future policy; the state and provider method exist, the workflow does not. |

### What is deliberately not built

- No custom wallet.
- No custom escrow or ledger.
- No deposit charge.
- No lender payout flow.
- No automatic transfer on acceptance.

---

## E. Location architecture

### Permission UX

1. Discover shows a short, dismissible explainer: **"Find clothes available near
   you."** with **Use my location** and **Not now**.
2. Only an explicit tap requests the OS permission.
3. A grant triggers one foreground `getCurrentPositionAsync` call with
   `Accuracy.Balanced`. There is no background tracking and no watcher.
4. A denial never blocks the app: Discover falls back to all published listings
   and manual area/text search.
5. The permission prompt is not shown again automatically. The entry point stays
   available in the Discover header.

### What is stored

| Data | Where | Exposed? |
| --- | --- | --- |
| Listing coordinates | `listings.latitude`, `listings.longitude` | **Never**. Service-layer only. |
| Listing area label | `listings.area_label` | Yes, e.g. "Bandra West". |
| Renter search coordinates | Request body only | No. Not persisted, not logged. |
| Meetup place | `meetup_proposals.place_name`, `area_label` | Yes, to both parties. Public place only. |
| Meetup coordinates | — | Never collected. |

The discovery endpoint is `POST`, not `GET`, so coordinates never appear in
URLs, access logs or proxy logs. The API logging interceptor additionally strips
query strings.

### Distance

- Haversine distance on the server, in
  `packages/shared/src/geo/distance.ts`.
- Returned distance is rounded: nearest 10 m below 1 km, nearest 100 m at or
  above 1 km.
- Coordinates are not returned by any endpoint, including the listing detail.
- Display examples: `48 m away`, `120 m away`, `350 m away`, `1.2 km away`.

Residual risk: repeated distance queries from different renter positions could
theoretically allow trilateration. The current mitigations are rounding and
never echoing coordinates. A future phase can add deterministic jitter or move
distance computation behind PostGIS with a privacy budget.

### Progressive discovery

Bands, defined once in `packages/shared/src/geo/distance.ts`:

```text
0–20 m, 20–50 m, 50–100 m, 100–150 m, 150–200 m, 200–500 m,
500 m–1 km, 1–2 km, 2–5 km
```

Bands are UI section labels. The server always searches up to the requested
maximum radius (default 5 km) and ranks continuously, so a strong match at
1.2 km can appear above a weak match at 72 m. Empty bands collapse. If there are
no results within 5 km, the app offers a wider search or removes the location
filter.

### Ranking

`packages/shared/src/geo/ranking.ts` is pure and reusable:

```text
score = 0.45 × distance decay
      + 0.30 × text relevance
      + 0.15 × availability fit
      + 0.10 × price fit
      + 0.00 × lender rating        (reserved)
      + 0.00 × listing quality      (reserved)
      + 0.00 × lender reliability   (reserved)
```

`distanceDecay = 1 / (1 + distanceMeters / 800)`.

Weights and the decay constant live in one exported object so the algorithm can
be tuned without touching screens or SQL. The API queries a bounding box of
candidates (capped at 200), then ranks in JavaScript. When the catalogue grows,
the same function can be fed by a PostGIS query or moved into SQL without
changing its contract.

Tie-break order: score, then distance, then newest listing.

### Listings without a location

A lender may publish with an area label only. Such listings are still
discoverable through text/area search, appear after distance-ranked listings,
and show the area without a distance. They are never hidden.

### Meetups

A meetup is a **public place**, not an address:

- `place_name` — "Blue Tokai, Bandra", "Phoenix Palladium", "Bandra Station"
- `area_label` — "Bandra West"
- `scheduled_at` — date + time
- `note` — optional, short

The proposal UI suggests categories (café, mall, station, other public place)
and repeats the rule: do not share a home address. No map pin and no
coordinates are collected in this phase. Either party can propose; the other
accepts or counter-proposes. There is at most one open proposal per rental.

---

## F. Data model changes

> **Applied:** `packages/db/drizzle/0002_striped_pete_wisdom.sql` was applied to
> the Supabase Postgres project on 2026-11-19 over the session pooler. The
> baseline migrations (`0000`, `0001`) were already recorded in
> `drizzle.__drizzle_migrations`, and `drizzle-kit generate` now reports no
> schema drift. Supabase auto-enables RLS on new `public` tables, so
> `rentals`, `rental_events`, `meetup_proposals` and `disputes` have RLS on with
> no policies — only the API's table-owner connection can read or write them.

### `listings` (extend)

| Column | Type | Notes |
| --- | --- | --- |
| `latitude` | `double precision` | Private. Never selected into a public response. |
| `longitude` | `double precision` | Private. |
| `area_label` | `text` | Public area, e.g. "Bandra West". |
| `fulfillment_methods` | `text[]` default `{in_person}` | Delivery reserved, not accepted by the API. |

Add index `(status, latitude, longitude)` for the bounding-box candidate query.

### `rentals` (new)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `listing_id` | `uuid` | `restrict` — history survives listing deletion. |
| `renter_id` / `lender_id` | `text` | `restrict` to `user.id`. |
| `status` | `text` | Rental status. |
| `fulfillment_method` | `text` default `in_person` | `delivery` reserved. |
| `start_date` / `end_date` | `date` | Intended window. |
| `days` | `integer` | Snapshot. |
| `price_per_day_rupees` | `integer` | Snapshot, parsed from the listing. |
| `rental_amount_rupees` | `integer` | `days × price`. |
| `cleaning_fee_rupees` | `integer` | Snapshot of the current fee rule. |
| `deposit_rupees` | `integer` default `0` | Reserved; not charged. |
| `total_rupees` | `integer` | Rental + cleaning. |
| `currency` | `text` default `INR` | |
| `payment_status` | `text` | Separate payment state. |
| `payment_provider` / `payment_reference` | `text` nullable | Null in placeholder mode. |
| `authorized_at` / `captured_at` / `voided_at` / `refunded_at` | `timestamptz` | |
| `requested_at` | `timestamptz` | |
| `respond_by_at` | `timestamptz` | `requested_at + 48h`. |
| `accepted_at` / `declined_at` | `timestamptz` | |
| `cancelled_at` / `cancelled_by` / `cancel_reason` | | `renter`, `lender`, `system`. |
| `activated_at` | `timestamptz` | Actual handover time. |
| `return_due_at` | `timestamptz` | `activated_at + days`. |
| `returned_at` / `completed_at` | `timestamptz` | |
| `handover_acknowledged_at` | `timestamptz` | Lender acknowledgement, not blocking. |
| `no_show_reported_by` / `no_show_reported_at` | | |
| `created_at` / `updated_at` | `timestamptz` | |

Indexes: `(renter_id, status)`, `(lender_id, status)`,
`(listing_id, status, start_date, end_date)`, `(respond_by_at)`.

### `meetup_proposals` (new)

| Column | Notes |
| --- | --- |
| `id`, `rental_id`, `proposed_by_id` | |
| `place_name`, `area_label` | Public place only. |
| `scheduled_at`, `note` | |
| `status` | `proposed`, `confirmed`, `superseded`, `cancelled`. |
| `responded_at`, `created_at` | |

At most one `proposed` or `confirmed` row per rental, enforced transactionally.

### `rental_events` (new)

| Column | Notes |
| --- | --- |
| `id`, `rental_id` | |
| `actor_id` | Null for system actions. |
| `type` | Action or system event. |
| `from_status` / `to_status` | |
| `metadata` | `jsonb`; never coordinates or payment secrets. |
| `created_at` | |

This is the timeline the detail screen renders, and the audit trail future
disputes and reliability scoring depend on.

### `disputes` (new)

| Column | Notes |
| --- | --- |
| `id`, `rental_id`, `opened_by_id` | |
| `category` | `item_not_as_described`, `not_handed_over`, `damaged`, `no_show`, `other`. |
| `details` | Free text, bounded. |
| `status` | `open`, `resolved`, `withdrawn`. |
| `resolution_notes`, `resolved_by_id`, `resolved_at` | Resolution workflow is future. |
| `created_at` | |

### Shared enums

All in `packages/shared/src/enums/` using the const-object + derived-union
pattern:

- `rental-status.ts` — `RENTAL_STATUSES`
- `rental-actions.ts` — `RENTAL_ACTIONS`, `RENTAL_ACTOR_ROLES`
- `fulfillment-method.ts` — `FULFILLMENT_METHODS`,
  `SUPPORTED_FULFILLMENT_METHODS`
- `payment-status.ts` — `PAYMENT_STATUSES`, `PAYMENT_MODES`
- `meetup-status.ts` — `MEETUP_STATUSES`
- `dispute.ts` — `DISPUTE_CATEGORIES`, `DISPUTE_STATUSES`

---

## G. API / backend requirements

All rental endpoints require an authenticated session and verify that the
caller is the renter or lender. Discovery and public listing reads stay
anonymous.

| Method + path | Purpose |
| --- | --- |
| `POST /api/listings/discover` | Nearby ranking. Body: coordinates (optional), max radius, query, filters, pagination. Returns `distanceMeters` and `areaLabel` only. |
| `POST /api/listings` | Existing create; now accepts private coordinates and a public area label. |
| `POST /api/rentals` | Create a request. Validates dates, blocked days, overlap, self-rental; authorizes payment. |
| `GET /api/rentals?role=&status=&limit=&offset=` | Paginated renter/lender lists. |
| `GET /api/rentals/:id` | Detail: rental, listing summary, counterparty, meetup, timeline, payment summary, server-computed capabilities. |
| `POST /api/rentals/:id/accept` | Lender accepts; re-checks availability and overlap under lock. |
| `POST /api/rentals/:id/decline` | Lender declines; voids authorization. |
| `POST /api/rentals/:id/cancel` | Either party before activation; reason required. |
| `POST /api/rentals/:id/meetup/proposals` | Propose or counter-propose. |
| `POST /api/rentals/:id/meetup/proposals/:proposalId/accept` | Other party agrees. |
| `POST /api/rentals/:id/check-in` | Record arrival. First check-in → `AT_MEETUP`. |
| `POST /api/rentals/:id/handover/confirm` | Renter confirms receipt → capture → `ACTIVE`. |
| `POST /api/rentals/:id/handover/acknowledge` | Lender records handover; never blocking. |
| `POST /api/rentals/:id/handover/issues` | Item problem → `DISPUTED`; no capture. |
| `POST /api/rentals/:id/no-show` | Report the other party absent → `NO_SHOW`. |
| `POST /api/rentals/:id/disputes` | Dispute entry point. |
| `POST /api/rentals/:id/return` | Renter marks returned. |
| `POST /api/rentals/:id/return/confirm` | Lender confirms → `COMPLETED`. |
| `POST /api/rentals/:id/payment/retry` | Retry a failed authorization. |

### Response rules

- Rental responses include `role`, `status`, `capabilities`, `timeline`,
  `listing` (public fields only), `counterparty` (`id`, `name`, `image` — never
  email), `meetup`, and a payment summary.
- No response contains coordinates, a home address, or a payment provider
  secret.
- Errors follow the existing Nest envelope (`statusCode`, `message`) and use
  `409` for an invalid or already-applied transition.
- Lists are paginated with `limit` / `offset` and return a total.

### Backend modules

```text
apps/api/src/
├── core/payments/            # provider interface + placeholder
└── modules/rentals/
    ├── rentals.module.ts
    ├── rentals.controller.ts        # create/list/detail
    ├── rental-actions.controller.ts # transitions
    ├── rentals.service.ts
    ├── rental-transitions.service.ts
    ├── rental-access.ts
    ├── rental-mappers.ts
    └── rental-expiry.ts
```

The listing discovery query lives in
`modules/listings/listings-discovery.service.ts` to keep `listings.service.ts`
under the 200-line cap.

---

## H. Edge cases

| Scenario | Behaviour |
| --- | --- |
| Lender declines | `DECLINED`; renter sees a plain explanation; authorization voided. |
| Renter cancels before meetup | `CANCELLED`; authorization voided; no fee in this phase. |
| Lender cancels before meetup | `CANCELLED`; authorization voided; event recorded for future reliability. |
| Renter does not show | Lender reports after the meetup time plus a 30-minute grace period → `NO_SHOW`; payment voided/refunded; dispute record. |
| Lender does not show | Renter reports → `NO_SHOW`; authorization voided. |
| Piece does not match the listing | Renter reports from `AT_MEETUP` or `HANDOVER_PENDING` → `DISPUTED`; no capture; rental never activates. |
| Payment authorization fails | `PAYMENT_FAILED`; request not sent; retry action. |
| Payment capture fails at handover | `PAYMENT_FAILED`; no activation; support/dispute path because the piece is with the renter. |
| Handover disputed | `DISPUTED`; funds held; nothing auto-releases. |
| Listing unpublished or dates taken between request and acceptance | `accept` returns `409`; the lender can decline; the request can expire. |
| Two parties act concurrently | Status-guarded update; second caller gets `409`; the app refetches. |
| Meetup missed or rescheduled | New proposal supersedes the old one; `MEETUP_PENDING` until agreed. |
| Request ignored for 48 hours | `EXPIRED`; authorization voided. |
| Return date passes | `RETURN_PENDING`; renter marks returned. |
| Lender never confirms return | Auto-completion after 72 hours is documented but deferred; it needs a scheduled job. |
| Location denied | Discover still works; area/text search; listings without coordinates show area only. |
| Listing has no coordinates | Discoverable by text/area; sorted after distance-ranked results; no distance label. |
| Renter tries to rent their own listing | `400`; the request is rejected. |
| Unauthenticated request | `401`; the app routes to sign-in and returns to the request. |

---

## I. MVP vs future scope

### Implemented now

- Nearby discovery with an opt-in device location and manual fallback.
- Modular distance ranking; progressive bands as UI labels.
- Private listing coordinates; public area label and rounded distance.
- Rental request, accept, decline, cancel, expiry.
- Public meetup proposal/accept, check-in.
- Renter-confirmed handover; lender acknowledgement recorded.
- `ACTIVE`, return, lender confirmation, completion.
- No-show reporting and dispute entry point.
- Payment provider interface, placeholder implementation, payment state/copy.
- In-person fulfillment only.

### Prepared, not implemented

- Razorpay/Stripe authorization, capture, refunds, payouts, webhooks.
- Deposits, damage protection, advanced dispute resolution.
- Delivery fulfillment and addresses.
- Identity verification, ratings, reliability scoring, earnings history.
- Chat/push notifications.
- Background jobs for expiry, auto-completion and payouts.
- PostGIS/earthdistance and privacy jitter.

No delivery UI, no custom wallet, no custom escrow, and no automatic payout on
acceptance.

---

## Implementation map

| Layer | Files |
| --- | --- |
| Enums | `packages/shared/src/enums/{rental-status,rental-actions,fulfillment-method,payment-status,meetup-status,dispute}.ts` |
| Contracts | `packages/shared/src/api/{rental-schemas,discovery-schemas}.ts` |
| Pure logic | `packages/shared/src/rentals/{pricing,state-machine}.ts`, `packages/shared/src/geo/{distance,ranking}.ts` |
| DB | `packages/db/src/schema/{rentals,meetups,disputes}.ts`, extended `listings.ts` |
| API | `apps/api/src/core/payments/*`, `apps/api/src/modules/rentals/*`, discovery service |
| Mobile | `apps/mobile/src/features/{discovery,rental}/*`, `app/rent/*`, `app/rentals.tsx`, `app/activity.tsx` |
| Docs | this file, `WEARLY_UI_UX_SPEC.md`, `SCREENS.md`, `PROFILE_PHASES.md` |

---

## Decision log

| Date | Decision |
| --- | --- |
| 2026-11-18 | In-person only; delivery reserved but rejected by the API. |
| 2026-11-18 | Placeholder payment provider; no money moves in this phase. |
| 2026-11-18 | Renter-confirmed handover activates the rental; lender acknowledgement is recorded but never blocking. |
| 2026-11-18 | `expo-location` for a one-shot opt-in location; no maps, no meetup coordinates. |
| 2026-11-18 | Basic return and completion included; deposits and payouts deferred. |
| 2026-11-18 | Mobile + API only; `apps/web` unchanged. |
| 2026-11-19 | Rental migration applied to Supabase; RLS stays on with no policies because the API is the only DB consumer. |
