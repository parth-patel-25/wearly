# Wearly — user roles & permissions

**Status:** Proposed — specification for future implementation
**Created:** 2026-10-13
**Type:** Documentation only. Nothing in this document is implemented, and no
application code, schema, or configuration was changed to produce it.
**Applies to:** `apps/mobile`, `apps/web`, `apps/api`, `packages/shared`
(future work)

**Sources inspected (source of truth for this document):**

| Source | What it establishes |
| --- | --- |
| `docs/WEARLY_UI_UX_SPEC.md` | Approved product spec: two-sided marketplace (§1, §7.7), no-forced-login (§6.1), rental flow (§7.4) |
| `docs/DESIGN_SYSTEM.md` | One-sentence persona list — "Renters browse… owners list… **admins** moderate the marketplace" (lines 5–6); "WEB/ADMIN" architecture label (line 18); §11 admin visual rules |
| `docs/auth-and-database.md` | Agreed-but-not-implemented auth stack: **Better Auth** + Drizzle + PostgreSQL, mounted in NestJS ("agreed, not yet implemented", decided 2026-09-27) |
| `docs/SCREENS.md` | Build tracker: Phase 1 shipped; listings, reviews, payment, availability all still unchecked |
| Application source | Prototype session with **no role field anywhere**; no auth provider installed; NestJS API has no auth guards |

### How claims are tagged

| Tag | Meaning |
| --- | --- |
| **[Verified]** | Confirmed in this repository today (code or approved docs) |
| **[Proposed]** | Defined by this document; not implemented, not yet agreed |
| **[Open]** | Unresolved — recorded in §14, not answered here |

---

## 1. Purpose and scope

This document is the single source of truth for Wearly's user roles,
access control, authentication boundaries, and role-specific functionality
when they are implemented.

In scope:

- Account categories (User, Admin, Support Agent)
- Marketplace capabilities and resource ownership
- A permissions matrix for marketplace and staff operations
- Authorization and security rules
- MVP vs future scope, implementation guidance, testing criteria

Out of scope:

- Database schema, API route design, payment integration specifics — no final
  schema is invented here
- UI/layout decisions (owned by `WEARLY_UI_UX_SPEC.md` / `DESIGN_SYSTEM.md`)
- Actual implementation — this is a reference document only

**Implementation status:** the repository currently has **no role model, no
permission checks, and no real authentication**. The mobile prototype uses an
in-memory fake session (`apps/mobile/src/core/providers/session-provider.tsx`,
**[Verified]**) with no user id and no role. The NestJS API exposes only
`health` and `notes` with no guards (**[Verified]**). Every permission below
is therefore **[Proposed]** unless tagged otherwise.

---

## 2. Wearly marketplace overview

**[Verified]** Wearly is a peer-to-peer clothing rental marketplace: people
discover clothing, rent it from other users, and list their own wardrobe
(`WEARLY_UI_UX_SPEC.md` §1). The product is explicitly **two-sided**
(spec §7.7: "Wearly is two-sided… friendly and guided, never a seller dashboard").

**[Verified]** Browsing requires no account; authentication is requested only
at the moment an action needs one — rent a piece, save a favourite, message a
lender, publish clothing, manage rentals, complete payment (spec §6.1). Any
permission model must preserve this "no forced login" rule.

**[Verified]** The rental flow is: product → dates → review → delivery/pickup →
price summary → authentication (if needed) → payment → confirmation (spec §7.4).
Whether the flow includes a lender **accept/reject step** is not settled by the
spec — see **[Open] Q1** in §14.

**[Verified]** Today's build: mobile Phase 1 (browse, product detail,
checkout UI, fake session) ships on mock data; the listing flow (Phase 3),
reviews, payments, and any admin surface do not exist (`docs/SCREENS.md`).

---

## 3. Role model and terminology

### 3.1 The three account categories

| Category | Who it is | Status |
| --- | --- | --- |
| **User** | A regular Wearly account. Supports **both** renting and lending on the same account. | **[Proposed]** as a formal model; the single-account two-sided intent is **[Verified]** (spec §1/§7.7) |
| **Admin** | Privileged staff account for marketplace management. | **[Proposed]**; named once in `DESIGN_SYSTEM.md` ("admins moderate the marketplace") **[Verified]** as intent only |
| **Support Agent** | Restricted staff account for customer support. Optional for MVP. | **[Proposed]**; the term appears nowhere in the repository today **[Verified]** |

### 3.2 Concept definitions (do not conflate these)

| Concept | Definition | Example |
| --- | --- | --- |
| **Account category** | The trust level of the account: `User`, `Admin`, `Support Agent` | A User who is also an Admin is still one account with elevated category |
| **Marketplace capability** | What a User can do on the marketplace: **renting** and **lending** — both available on every User account | A User with no listings still has the lending capability; they just have not used it |
| **Resource ownership** | Whether a user owns a specific resource (a listing, a profile) | Ana owns listing L1; she cannot edit Bo's listing L2 |
| **Booking participation** | Whether a user is the renter or the lender on a specific booking | Carlos can see booking B7 only because he is the renter on it |
| **Permission** | An explicit authorization to perform an action, given category + ownership + business conditions | "Approve refund" is a permission; "is authenticated" is not one |
| **Account status** | The lifecycle state of an account: active, restricted, suspended, closed (§7) | A suspended User keeps ownership records but cannot act |

### 3.3 Terminology mapping (existing wording → this model)

**[Verified]** The repository uses "renter", "lender", and "owner" freely in
UI copy and specs. Those words are **not** account roles and must not become
mutually exclusive account types:

| Existing usage | Where | Correct interpretation in this model |
| --- | --- | --- |
| "renter" | UI copy, empty states, product comments | A User **exercising the renting capability** (or a booking participant as renter) |
| "lender" | UI copy, spec §6.1 ("message a lender") | A User **exercising the lending capability** on a given listing |
| "owner" | Spec §2.3/§7.3 product detail | The **owner of a listing** (resource ownership), not an account category |
| `interface Lender { name; neighbourhood; verified }` | `apps/mobile/src/shared/data/catalogue.ts` | **Prototype product metadata** attached to mock pieces — not a user model. **[Verified]** |
| "admins" | `DESIGN_SYSTEM.md` line 6 | The **Admin** account category |
| "WEB/ADMIN" | `DESIGN_SYSTEM.md` architecture diagram | A hint that the web app may host a future admin surface — **not confirmed** **[Open] Q4** |

**Rule:** never use "renter" and "lender" as mutually exclusive **account
roles**. A single User account is simultaneously a potential renter and a
potential lender; which one applies depends on the resource or booking being
discussed.

---

## 4. User: renter and lender capabilities

**Core rule (this document's primary requirement):**

> **A User is one account category. Renting and lending are capabilities of
> that account, not separate account types. A user must never be required to
> create a second account to list clothing after renting, or to rent after
> listing.**

**[Verified]** This matches the current product: the prototype has exactly one
session shape with no role split, and the spec describes a two-sided marketplace
driven by the same people.

A user may: have no listings, only rent, only lend, or do both — at any time,
without any account change.

### 4.1 Renter capabilities (same User account)

| Capability | Status |
| --- | --- |
| Discover, browse, and search listings (no account required for browsing) | Browse **[Verified]** (spec §6.1); account-gated parts **[Proposed]** |
| View clothing details, pricing, availability, rental conditions | **[Verified]** UI (product detail screen) |
| Save favourites / wishlist | **[Verified]** prototype (in-memory only); persistence **[Proposed]** |
| Request or create bookings for specific rental dates | Date selection + checkout UI **[Verified]**; booking records **[Proposed]** |
| Complete payments through the configured payment system | **[Proposed]** — no payment system exists **[Verified]** (Phase 2 unchecked) |
| View booking history and rental status | Empty-state screen **[Verified]**; real history **[Proposed]** |
| Manage pickup, delivery, return workflows where supported | **[Proposed]** (tracking screen unchecked) |
| Request assistance with cancellations, refunds, disputes | **[Proposed]** |
| Submit reviews and ratings when eligible | **[Proposed]** (reviews screen unchecked) |
| Manage profile and account settings | Profile screen **[Verified]** (empty state); real settings **[Proposed]** |

### 4.2 Lender capabilities (same User account)

| Capability | Status |
| --- | --- |
| Create and manage clothing listings | **[Proposed]** — listing flow is Phase 3, all unchecked **[Verified]** |
| Upload images; descriptions, sizes, brands, conditions, categories | **[Proposed]** |
| Set rental prices, availability, rental conditions | **[Proposed]** |
| Receive, review, accept or reject booking requests *if* the implemented booking model includes them | **[Proposed]** + **[Open] Q1** |
| Manage availability calendars; prevent conflicting bookings | **[Proposed]** (validated server-side, rule 9.8) |
| Track active and completed rentals | **[Proposed]** |
| Coordinate handovers and returns | **[Proposed]** |
| Review returned items; report damage or missing items | **[Proposed]** |
| View earnings, fees, payout status when the payment system supports them | **[Proposed]** — no payment/payout system exists **[Verified]** |
| Manage listing visibility and availability | **[Proposed]** |

---

## 5. Admin responsibilities

**[Proposed]** Admin is a privileged staff category responsible for managing
the marketplace. The repository confirms only the intent — "admins moderate the
marketplace" (`DESIGN_SYSTEM.md` line 6) — everything below is proposed scope.

Responsibilities:

- [ ] Manage user accounts: restrictions, suspensions, reinstatements
- [ ] Review reported listings and user complaints
- [ ] Moderate listings and inappropriate content (remove, unpublish, reinstate)
- [ ] Investigate booking disputes and damage claims
- [ ] Review transaction and refund issues **within authorized limits**
- [ ] Monitor platform activity and marketplace health
- [ ] Review platform analytics and operational reports
- [ ] Manage categories and other configurable marketplace settings, if supported
- [ ] Access audit logs and administrative records (read-only)
- [ ] Escalate unresolved cases (internally, or when policy requires)

**Constraints:**

- Administrative privileges **must be enforced server-side** wherever a backend
  exists (§10). Hiding an admin screen in the client is not authorization.
- Admin does **not** automatically imply access to payment credentials, auth
  secrets, raw keys, or unrestricted personal data. Sensitive data access is
  need-based, minimized, and audited.
- Admin actions that affect other users (suspend, moderate, refund, edit
  another user's listing) are **audit-logged** (§10.9).
- Admin is not a separate product — `DESIGN_SYSTEM.md` §11 governs admin UI
  visuals **[Verified]**; this document governs what admin may *do*.

---

## 6. Support Agent responsibilities

**[Proposed]** Support Agent is a restricted staff category for customer
support operations. **It is optional for the initial MVP** and should be
introduced only when support workload requires it. The term appears nowhere in
the repository today **[Verified]**; treat this section as a **future
extension**, not an MVP requirement.

Proposed responsibilities:

- [ ] View and respond to support tickets
- [ ] Assist renters and lenders with booking questions
- [ ] Review relevant booking details and customer-submitted evidence
- [ ] Help coordinate dispute resolution
- [ ] Record support notes and case status
- [ ] Escalate complex disputes, account restrictions, and sensitive financial
      issues to Admin
- [ ] View **only** the user and transaction information required for the
      assigned support task (least privilege, §10.4)

**Constraints:**

- Support Agents **do not** automatically receive any Admin permission.
- Support Agents cannot suspend users, approve refunds, moderate listings, or
  access platform configuration — they escalate (§8 matrix rows 13, 18, 6, 23).
- Support access to user/booking data is scoped to assigned tickets and
  recorded in the access log.

---

## 7. Account lifecycle and status

**[Proposed]** No account-status policy exists in the repository today
**[Verified]** — the prototype's session is a boolean. The following states are
proposed as the model to implement:

| Status | Who sets it | Allowed | Blocked | Notes |
| --- | --- | --- | --- | --- |
| **Active** | Default on registration | Everything granted by the permissions matrix | — | Normal state |
| **Restricted** | Admin | Browsing, viewing own resources; possibly reading tickets | Publishing, booking, reviews, payouts — per restriction scope | Granularity is **[Open] Q3** |
| **Suspended** | Admin | Viewing own data, contacting support | All marketplace actions: create/edit listings, book, review, refund requests | Suspension policy details **[Open] Q3** |
| **Closed** | User (self) or Admin | Nothing; data handled per retention policy | Everything | Deletion/retention policy **[Open] Q3** |

Rules (**[Proposed]**, mirrors §9 rule 7):

- Suspension/restriction is applied **only by Admin**, always audit-logged.
- A suspended account keeps its **ownership records** (listings, bookings,
  history) — suspension blocks *actions*, it does not erase relationships.
  What happens to the suspended user's active bookings is **[Open] Q3**.
- Accounts cannot change their own category or status (§10.6).
- Guests (unauthenticated) may only perform public read operations (matrix
  column "Guest").

---

## 8. Permissions matrix

**Reading rules:**

- `✅` allowed · `🔶` conditional — the stated condition must hold, verified
  server-side · `⛔` not allowed by default
- **Authentication alone grants nothing beyond browsing public content.** No
  row is `✅` for a User merely because they are signed in.
- Every `🔶` states its condition explicitly; unspecified conditions default to
  `⛔`.
- All rows are **[Proposed]**; the Guest-browsing row reflects **[Verified]**
  behavior (spec §6.1).

| # | Operation | Guest | User | Support Agent | Admin | Condition |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Browse / search public listings | ✅ | ✅ | ✅ | ✅ | Public data only; no account required **[Verified]** |
| 2 | Create a listing | ⛔ | ✅ | ⛔ | ⛔ | Authenticated + account Active; lending is a User capability, not a separate account |
| 3 | Edit own listing | ⛔ | 🔶 | ⛔ | 🔶 | Caller owns the listing; fields immutable while a rental on it is active (rule 9.8) |
| 4 | Edit another user's listing | ⛔ | ⛔ | ⛔ | 🔶 | Admin only, via an explicit authorized moderation workflow, audit-logged |
| 5 | Delete / deactivate own listing | ⛔ | 🔶 | ⛔ | 🔶 | Caller owns the listing; hard delete blocked while bookings are active/upcoming — deactivate instead |
| 6 | Moderate another user's listing | ⛔ | ⛔ | ⛔ | ✅ | Admin only; Support may flag/escalate but not moderate; audit-logged |
| 7 | Create a booking | ⛔ | 🔶 | ⛔ | ⛔ | Authenticated + Active; dates must be available (server-validated, rule 9.8); payment flow when implemented; self-booking policy **[Open] Q7** |
| 8 | View own bookings | ⛔ | ✅ | ⛔ | 🔶 | User sees bookings where they are renter or lender; Admin per operational need + audit |
| 9 | View another user's booking | ⛔ | 🔶 | 🔶 | 🔶 | User: only if a legitimate participant; Support: assigned support task, minimum necessary fields; Admin: operational need, audited |
| 10 | Accept / reject a booking request as the relevant lender | ⛔ | 🔶 | ⛔ | ⛔ | Caller is the lender-participant on that booking; booking status = pending; **forbidden when the requester is the same user** (rule 9.1); only meaningful if the approval model is adopted **[Open] Q1** |
| 11 | Initiate a cancellation request | ⛔ | 🔶 | 🔶 | 🔶 | Booking participant only; permitted only in states defined by the cancellation policy **[Open] Q3**; Support/Admin act through the case workflow, not as the requester |
| 12 | Request a refund | ⛔ | 🔶 | ⛔ | ⛔ | Renter/payer of that booking; within refund window and valid booking state (rule 9.6); Support may guide, but the action is the user's |
| 13 | Approve / process a refund | ⛔ | ⛔ | ⛔ | 🔶 | Admin only, within authorized limits, audit-logged; actual money movement may sit with the payment provider **[Open] Q2** |
| 14 | Report damaged or missing clothing | ⛔ | 🔶 | 🔶 | 🔶 | Booking participant (lender, or renter per policy) during the defined claim window on a real completed/returning booking |
| 15 | Submit an eligible review | ⛔ | 🔶 | ⛔ | ⛔ | Booking participant + completed qualifying rental (rule 9.5); within review window; once per booking |
| 16 | Manage own profile / settings | ⛔ | ✅ | ✅ | ✅ | Self only; account category is never user-editable (§10.6) |
| 17 | Manage another user's account | ⛔ | ⛔ | 🔶 | ✅ | Support: limited fields for an assigned case, minimum necessary; Admin: per policy; sensitive fields need elevated need + audit |
| 18 | Suspend or restrict a user | ⛔ | ⛔ | ⛔ | ✅ | Admin only; Support escalates; always audit-logged |
| 19 | View support tickets | 🔶 | 🔶 | ✅ | ✅ | User/Guest: only tickets they created; Support: queue/assigned tickets only |
| 20 | Respond to support tickets | 🔶 | 🔶 | ✅ | ✅ | Same scoping as row 19; users reply only within their own ticket thread |
| 21 | Review disputes | 🔶 | 🔶 | 🔶 | ✅ | User: own dispute (submit evidence, view status); Support: assist and coordinate; Admin: decide and resolve |
| 22 | Access platform analytics | ⛔ | ⛔ | ⛔ | ✅ | Admin; aggregate metrics preferred; PII access only when justified and audited |
| 23 | Manage platform configuration | ⛔ | ⛔ | ⛔ | ✅ | Categories, policies, settings; changes audit-logged |
| 24 | View audit logs | ⛔ | ⛔ | ⛔ | ✅ | Admin, read-only; logs are append-only — no one, including Admin, can edit entries |

**Matrix consistency checks:** every row granting User access beyond row 1 is
either ownership-scoped (`🔶`), participation-scoped, or business-rule
conditional. Support Agent rows never exceed assist/limited scope; every
privilege beyond that is Admin-only (rows 4, 6, 13, 18, 22, 23, 24).

---

## 9. Resource ownership and booking authorization

All nine rules below are **[Proposed]** — the approved product specification
does not currently establish them **[Verified]**. Each rule maps to matrix rows.

1. **No self-approval.** A user cannot approve their own booking as a lender
   when they are also the renter on it. (Matrix row 10.)
2. **No cross-user listing edits.** A user must not edit or delete another
   user's listing unless an explicitly authorized administrative workflow
   permits it. (Rows 3–6.)
3. **Own-and-participant booking visibility.** Users may view their own
   bookings and bookings where they are a legitimate participant, subject to
   privacy restrictions — non-participants see nothing. (Rows 8–9.)
4. **Lenders manage requests for their own listings.** A lender may manage
   booking requests associated only with listings they own — never another
   lender's. (Rows 10, 11.)
5. **Review eligibility.** Reviews require a defined qualifying state — a
   completed rental where the reviewer was a participant — plus a window and a
   one-review-per-booking limit. (Row 15.)
6. **Authorized refund and damage workflows.** Refunds and damage claims follow
   authorized workflows and valid booking states; requests are participant-only,
   approvals are Admin-only. (Rows 12–14.)
7. **Suspension blocks actions.** Suspended/restricted accounts are prevented
   from restricted activities per §7 policy; ownership records remain intact.
8. **Server-validated availability.** Listing availability and booking conflicts
   are validated by the trusted application/backend, never trusted from the
   client. (Rows 7, 3.)
9. **Audited administration.** Administrative access never bypasses auditing or
   privacy safeguards — including the audit logs themselves (row 24).

---

## 10. Security and privacy requirements

All **[Proposed]**. Where a statement references the planned stack, that stack
is the repository's agreed direction (**[Verified]** in
`docs/auth-and-database.md`, "agreed, not yet implemented") — no other
third-party provider is prescribed by this document.

1. **Authentication ≠ authorization.** Authentication proves *who* the caller
   is (Better Auth session — planned); authorization decides *what* they may do
   (this document's matrix). Both are required; neither substitutes for the
   other.
2. **Server-side enforcement of privileged operations.** Every non-public
   operation is authorized on the server (the NestJS API is the intended single
   enforcement point per `auth-and-database.md` §3). A client check is UX, never
   a security boundary. **The current app is client-heavy with no backend
   guards — hiding a button in the mobile UI grants nothing once an API
   endpoint exists; the endpoint must re-check.**
3. **Resource-level ownership checks.** Ownership (`listing.ownerId ==
   session.userId` conceptually) is verified server-side per request, in
   addition to role checks. Never infer ownership from client-supplied ids.
4. **Booking-participant authorization.** Access to bookings, disputes, and
   reviews is limited to participants (renter/lender on that record), checked
   against server-side data (rows 8–15, 21).
5. **Least privilege.** Default deny. Support Agents get only what an assigned
   task requires; Admin gets sensitive-data access only when justified. Every
   new endpoint starts from `⛔` and earns its allowance.
6. **No self-elevation.** Account category (`user` / `admin` /
   `support_agent`) is never writable through any user-facing profile,
   signup, or settings endpoint. Category changes happen only through an
   internal Admin process, audit-logged. Sign-up always creates `user`.
7. **Safe suspension handling.** Suspension revokes action permissions server-
   side immediately (including invalidating or downgrading the session per
   policy **[Open] Q3**) while preserving records. Suspended users receive
   honest, non-leaky error states in the UI.
8. **State-transition validation.** Listing, booking, and review state
   transitions (e.g. pending → accepted → active → completed; review only from
   `completed`) are validated against allowed transitions server-side;
   illegal transitions are rejected regardless of caller role — Admin included,
   except through explicit override workflows.
9. **Financial decision restrictions.** Refund approval and financial dispute
   resolution are Admin-only (rows 13, 21), bounded by "authorized limits",
   and always audited. Support Agents escalate; they never approve.
10. **Audit logging.** Sensitive administrative actions (suspend, moderate,
    refund, account edit, config change) write immutable audit entries: who,
    what, when, on which resource, and the case/reason reference. Logs are
    append-only (row 24).
11. **Personal data and financial protection.** User PII and payment data are
    minimized in every view; Support sees case-scoped fields only (row 9, 17);
    payment credentials/secrets are never part of any role's routine access
    (§5 constraints). Handle data per applicable privacy requirements when the
    payment system lands **[Open] Q2**.
12. **Session and credential security.** Follow the agreed auth stack
    (`auth-and-database.md`): Better Auth sessions, Expo client storage in
    SecureStore, cookie handling for native, secret rotation notes (rotating
    `BETTER_AUTH_SECRET` invalidates sessions). No additional provider is
    introduced by this document.
13. **Rate limiting and abuse prevention.** Auth, booking creation, review
    submission, messaging, and ticket creation are rate-limited per account/IP;
    repeated authorization failures are logged as an abuse signal. Exact limits
    are an implementation detail **[Open]**.
14. **Consistent checks across entry points.** Every API route, background job,
    and internal tool applies the same authorization predicates — ideally one
    shared authorization module, so web, mobile, and batch paths cannot drift
    apart. The planned global `AuthGuard` in `auth-and-database.md` (Step 5 /
    Gotcha #1) is the natural foundation: protected by default, with explicit
    anonymous allowances for public reads (row 1).

---

## 11. MVP scope vs future enhancements

**[Verified]** nothing below is implemented today — no role field, no guards,
no admin screens. The lists are what to build, split by priority.

### MVP

- [ ] One regular **User** account supports both renting and lending (model
      already implicit in the single-session prototype — must be preserved)
- [ ] Listing ownership checks (edit/delete/moderate rows 3–6)
- [ ] Booking and participant permissions (rows 7–11)
- [ ] Basic **Admin** access: category assignment, user suspension, listing
      moderation, dispute review (rows 17, 18, 4, 6, 21)
- [ ] Basic account restrictions and listing moderation with audit entries
- [ ] Essential authorization and security rules from §10 (server-side,
      default-deny, no self-elevation)
- [ ] A permission model that is **testable** — matrix rows expressed as
      executable predicates (§12)
- [ ] Guest browsing without login (preserve spec §6.1)

### Future enhancements

- [ ] Dedicated **Support Agent** role (§6) — introduce when support workload
      requires it
- [ ] Fine-grained staff permissions beyond the two staff categories
- [ ] Advanced dispute-management workflows (evidence upload, timelines)
- [ ] Expanded audit dashboards (beyond raw log access, row 24)
- [ ] Configurable administrative permission groups
- [ ] Advanced fraud and abuse detection on top of rate limiting (§10.13)
- [ ] Optional referral to `DESIGN_SYSTEM.md` "WEB/ADMIN" surface once admin
      UI is actually scheduled **[Open] Q4**

---

## 12. Implementation guidance

Recommendation only — **do not implement from this task**; use this as the
engineering brief when the work is scheduled.

### 12.1 Suggested terminology (code-facing)

- Account category: one server-side field, proposed values `user` |
  `admin` | `support_agent` (naming **[Open] Q5**). Stored where Better Auth's
  generated user record lives — exact modeling is an open decision, this
  document does not dictate a schema.
- Capabilities (`renting`, `lending`) are **not** stored as roles — they are
  implied by the User category and evidenced by listings/bookings existing.
- Keep the mapping table (§3.3) as the dictionary for code review: a variable
  named `isRenter` as an account flag is a review failure.

### 12.2 Boundaries and enforcement points

- **Authentication boundary:** Better Auth mounted at `/api/auth/*` in
  `apps/api` (agreed architecture, `auth-and-database.md` §3).
- **Authorization boundary:** NestJS guards on routes + a shared authorization
  service for the predicates (ownership, participant, status, category).
  Proposed layering: (1) global auth guard → authenticated or anonymous;
  (2) role guard for category-gated rows (Admin/Support); (3) resource-level
  checks (ownership/participant/state) in guards or service layer;
  (4) audit log on privileged mutations.
- **Single source of truth:** matrix rows implemented once as named
  predicates (`canEditListing(actor, listing)`, `canModerate(actor, listing)`,
  `canApproveRefund(actor, paymentCase)`, …) reused by API and UI.

### 12.3 Route and screen access

- API: public reads open; everything else authenticated by default (matches
  the planned global `AuthGuard`), with category checks where the matrix says
  Admin/Support.
- Mobile/web screens: gate navigation for UX (hide List management behind
  sign-in as today, add admin UI only for admin categories) — **never** as the
  enforcement mechanism. Return 401 unauthenticated, 403 authenticated-but-
  forbidden, and consider 404 for resources the caller must not know exist.

### 12.4 Permission-aware UI

- Buttons/menus enabled by the same shared predicates, so UI and API cannot
  disagree.
- Disabled vs hidden: destructive staff actions hidden; user actions with
  business-state conditions (row 5) disabled with an explanation.
- Never render an input whose submission the server will always reject.

### 12.5 Database and API considerations (no schema invented)

- Store category server-side on the account record; never accept it from the
  client. (Column design, migration, and whether to use Better Auth's admin
  plugin are **[Open] Q5**.)
- Listings need an owner reference; bookings need renter + listing references
  and a status enum with validated transitions (§10.8).
- Audit entries are their own append-only record.
- API responses must respect row 9: participants/Support/Admin only, with
  field-level minimization for Support.

### 12.6 Migration considerations

- Greenfield advantage **[Verified]**: no incompatible role system exists to
  migrate. When roles are introduced, **all existing accounts default to
  `user`**; Admin is granted explicitly, never by self-service.
- The prototype's fake session is replaced wholesale by the agreed auth stack —
  no session migration needed.

### 12.7 Testing requirements

- **Table-driven unit tests** generated from §8: every row × each category ×
  ownership/ownership-negative × relevant states (see §13).
- **Integration tests per endpoint:** anonymous → 401; wrong category → 403;
  non-owner → 403; wrong booking state → 403/409; correct actor → success;
  privileged mutation → audit entry written.
- **Negative tests for escalation:** self-update of category rejected; Support
  attempting rows 13/18/23 rejected; Admin editing audit logs rejected.
- **Regression gate:** any new endpoint must state its matrix row or add one.

---

## 13. Testing and acceptance criteria

### Acceptance checklist (this document)

- [x] User established as a single account category with both renting and
      lending capabilities (§4)
- [x] User, Admin, and optional Support Agent distinguished (§3, §5, §6)
- [x] Comprehensive permissions matrix covering all 24 required operations
      with explicit conditions (§8)
- [x] Ownership and booking-participant restrictions stated as rules (§9)
- [x] Security and privacy requirements defined (§10)
- [x] MVP separated from future enhancements (§11)
- [x] Verified vs proposed vs open clearly tagged throughout
- [x] Unresolved decisions recorded, not invented (§14)
- [x] Suitable as an implementation reference (§12)
- [x] No application files modified (documentation-only task)

### Future implementation acceptance (for when the model is built)

- [ ] A User can rent and list with one account — no second registration path
      anywhere in flows or docs
- [ ] Matrix §8 has a 1:1 mapping to automated tests; all pass
- [ ] Anonymous call to any non-public endpoint → 401
- [ ] Authenticated non-owner edit of another user's listing → 403 + no mutation
- [ ] Renter attempting to approve own booking → 403 (rule 9.1)
- [ ] Support Agent attempting refund approval/suspend/config → 403
- [ ] User attempting to set own category to admin via API → rejected, logged
- [ ] Suspended account cannot create bookings/listings/reviews → 403
- [ ] Every privileged mutation produces an audit entry; entries unmodifiable
- [ ] Availability conflict request rejected server-side (double-booking
      impossible)
- [ ] Review submitted without a completed qualifying rental → rejected
- [ ] UI hides what the API forbids, and API still forbids what UI forgets

---

## 14. Open questions and unresolved decisions

Recorded, not invented. Resolve before or during implementation.

| # | Question | Why it matters | Affects |
| --- | --- | --- | --- |
| Q1 | **Booking model:** instant book vs lender accept/reject vs both per listing? Spec §7.4 flow shows no approval step; matrix row 10 assumes the approval model may exist | Decides whether row 10 is live at MVP | Rows 7, 10, 11 |
| Q2 | **Payment/refund provider** and who physically executes refunds | Row 13 "process a refund" may be provider-side; PCI/PII scope | Rows 12–13, §10.9/11 |
| Q3 | **Cancellation, refund-window, dispute, and suspension policies** (states, time limits, what happens to active bookings of suspended users) | Conditions in rows 11, 12, 14 and §7 are placeholders until policy exists | Rows 11, 12, 14, §7 |
| Q4 | **Admin surface:** is the web app the admin UI (`DESIGN_SYSTEM.md` "WEB/ADMIN" hint) or mobile-only staff screens? | Affects route gating, not the permission model | §11, §12.3 |
| Q5 | **Role storage:** custom field vs Better Auth `admin` plugin (`auth-and-database.md` Gotcha #6 mentions admin plugin only as an example); naming of category values | Schema and guard design | §12.1, §12.5 |
| Q6 | **Support Agent timing:** confirm it stays post-MVP until support volume justifies it | Scope control | §6, §11 |
| Q7 | **Self-booking:** may a user book their own listing (e.g. testing)? Rule 9.1 forbids self-*approval*, but creation policy is undefined | Row 7 condition | Row 7 |
| Q8 | **Review eligibility details:** exact qualifying states, window length, edited/deleted review policy | Row 15 is directionally right but not precise | Row 15 |
| Q9 | **Identity verification:** spec mentions "verification where applicable" — what is verified, who verifies, does it gate permissions? | Could add conditions to rows 2, 7 | Rows 2, 7 |
| Q10 | **Support data scope:** exact field-level minimization rules for Support views (row 9/17) and retention of support notes | Privacy compliance | Rows 9, 17, §10.11 |
| Q11 | **Rate-limit targets** for auth/booking/review/ticket endpoints (§10.13) | Abuse prevention tuning | §10.13 |
| Q12 | **First Admin bootstrap:** how the first admin is provisioned securely (one-time mechanism, not self-signup) | §10.6 must have an origin story | §10.6 |

---

## 15. Glossary

| Term | Definition |
| --- | --- |
| **Account category** | Trust level of an account: User, Admin, Support Agent (§3.2) |
| **User** | The single regular account category; holds both renting and lending capabilities |
| **Admin** | Privileged staff category for marketplace management (§5) |
| **Support Agent** | Restricted staff category for customer support; future extension (§6) |
| **Renter / Lender** | Contextual terms for a User acting in a booking or on a listing — **never** account categories (§3.3) |
| **Owner** | The User who created a given listing (resource ownership) |
| **Marketplace capability** | Renting or lending — behavior available to every User account |
| **Permission** | Explicit authorization for an action given category + ownership + state |
| **Resource ownership** | Ownership relation between a user and a listing/profile/booking they created |
| **Booking participant** | A user who is the renter or lender on a specific booking |
| **Account status** | Lifecycle state: active, restricted, suspended, closed (§7) |
| **Default deny** | Every operation is forbidden unless a rule explicitly allows it |
| **Least privilege** | Each category receives only the access its tasks require |
| **Audit log** | Append-only record of sensitive administrative actions |
| **Server-side enforcement** | Authorization checks performed by the backend, never only in the client |
| **Qualifying rental** | A completed rental that makes a review eligible (row 15) |
| **Prototype session** | The current in-memory fake login — no real auth, no roles **[Verified]** |

---

*Documentation-only change. No application code, schema, auth logic,
navigation, UI, dependencies, or configuration were modified.*
