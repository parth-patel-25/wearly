# Wearly — UI/UX build specification

Status: approved product specification · Source: original brief, normalised
Last updated: 2026-09-29

This is the **product** spec: what Wearly should feel like and which screens
exist. It is deliberately separate from `DESIGN_SYSTEM.md`, which is the
**implementation** spec: the tokens, rules and component APIs that make the
product look the way this document describes.

> **Read both before touching UI.** `WEARLY_UI_UX_SPEC.md` answers *what* we are
> building and *why it should feel like this*. `DESIGN_SYSTEM.md` answers *how*
> it is built and *what you are not allowed to hard-code*.

---

## 1. What Wearly is

A peer-to-peer clothing rental marketplace. People discover clothing, rent it
from other people, list their own wardrobe, and manage their rentals.

It should feel like a beautiful modern boutique brought into a mobile app.

**It must not feel like** a crowded marketplace, a discount shopping app, a
traditional e-commerce app, a corporate SaaS product, a sterile luxury fashion
site, or a social media feed.

The first impression is the goal:

> "This feels beautiful, warm, simple and trustworthy."

**Optimise for `clarity + emotion + trust + simplicity` — not information
density.** A first-time visitor should feel "I don't know this marketplace yet,
but this product feels thoughtfully made."

---

## 2. Design philosophy

Four principles decide every layout argument.

### 2.1 Give it space

Do not fill every pixel. Generous whitespace. Images, cards and primary actions
breathe. When a layout feels tight, the fix is a spacing token — not a negative
margin.

### 2.2 Make important things big

Primary cards, product imagery and primary actions are larger and more
comfortable than a typical marketplace. The interface should feel tactile.

### 2.3 Reveal complexity progressively

The first view of anything is simple. Depth is one tap away.

A product **card** shows: image · name · rental price · favourite.

A product **detail page** reveals: sizes · condition · availability · owner ·
reviews · duration · deposit · delivery/pickup · policies.

### 2.4 Every interaction should feel intentional

Interactions are smooth, soft, subtle, fast and slightly playful. Motion is used
to explain what happened — never to decorate.

---

## 3. Visual direction

**Colour** — a warm, pink-centred system. Soft blush, warm pink, cream/off-white,
warm white, soft neutral grey, dark warm text, very subtle accents.

The pink must read *premium + warm + cute*, never *loud + childish + flashy*.
No neon pink, no aggressive gradients, no childish saturation.

Semantic colours for success / error / warning / information, all harmonised with
the warm system.

> Implemented. The exact values, both themes, and the two deliberate contrast
> deviations are in `DESIGN_SYSTEM.md` §3 and `packages/design-tokens/colors.css`.

**Typography** — clean modern sans-serif (Satoshi), modern, elegant, readable,
slightly friendly. A real hierarchy: display → section heading → card title →
body → secondary → caption → price → button. Do not add sizes to this list.

**Shape** — generous corner radii on cards, buttons, inputs, bottom sheets,
navigation, dialogs and imagery. Soft and approachable. No sharp rectangles
without a strong UX reason. But do **not** make everything pill-shaped — a
consistent shape system, not a uniform one.

> Implemented. The scale and per-component radius defaults are in
> `DESIGN_SYSTEM.md` §5 and `radius.css`.

---

## 4. Cards, buttons and motion

**Cards** are the most important component. Large, soft, spacious, premium,
touchable. A product card prioritises the **image**. It is not overcrowded with
labels, badges, descriptions or competing buttons.

```
[            image            ]   ♡
  Satin slip dress
  ₹299 / 3 days
  Indiranagar
```

**Primary buttons** are noticeably larger and more comfortable than a typical
mobile interface. They feel physical. Large touch targets, rounded corners,
strong-but-soft hierarchy, clear labels. Obvious without being aggressive.

**Motion system** — consistent and fast:

| Interaction | Behaviour |
| --- | --- |
| Button press | `1.0 → 0.97 → 1.0`, very short, soft spring back |
| Favourite heart | small pop, smooth colour transition |
| Card → detail | **hero expansion** — the card opens into the page |
| Bottom sheet | slides from the bottom, scrim fades in |
| Screen change | gentle fade / scale, never delays navigation |

Apply the same hero expansion to product → detail, rental card → rental
details, profile preview → profile, listing preview → editor. Do **not** force a
shared-element animation where it would hurt usability.

**Never** add excessive bouncing, long animations, distracting transitions,
constant movement, or animations that delay navigation.

> Implemented. The token-level rules and the one documented motion exception are
> in `DESIGN_SYSTEM.md` §8 and §10.

---

## 5. Navigation

A modern bottom navigation: rounded, comfortable, minimal, slightly elevated,
easy to read. Consistent across the whole app.

```
Home · Discover · List · Profile
```

**Four equal destinations.** No centre button, no special case.

Rentals is no longer one of them. Its screen stays registered and deep-linkable,
but a wardrobe list is somewhere you visit deliberately rather than one of the four
things you bounce between all day, so it is reached from Home or a product card.
Dropping it is also what gives the bar's slot enough width for the active circle
below. See `DESIGN_SYSTEM.md` §10.

**One active circle that travels.** Exactly one white circle, carrying the filled
glyph of the destination you tapped, which *slides* across the bar and sits raised
above its top edge. Never one background per tab fading in and out: that reads as
"the old tab disappeared and a new one appeared", whereas a single object crossing
the bar reads as "this is the same control, and this is where I am now".

The circle and its glyph are one object. An inactive destination shows its outline
icon in place; the active one's icon is drawn inside the circle, with its slot held
at the same size so the bar cannot change height mid-travel.

The movement is short and soft — roughly 250–350ms on `SPRING.tab`, easing into
rest, with at most a whisper of overshoot. It must not delay the navigation: the
screen changes as the circle starts moving, not after it lands.

---

## 6. First run

**Never open on a login screen.** The first experience is a brand moment.

1. **Splash** — fabric-reveal brand moment. The approved flow-mark SVG (soft
   `w` + two leaves, exact geometry and brand pinks) is unveiled left→right
   as if soft fabric is flowing into the mark — never a generic fade, bounce
   or spinner — then the `wearly` wordmark and `WEAR / RENT / REPEAT` tagline
   arrive quietly beneath it (~1.8s total, calm crossfade into the app). In
   the spirit of a warm emotional brand introduction, but with its own
   identity and assets. It must feel like *"Welcome to Wearly"*, not *"Please
   create an account"*.
2. **Welcome / personalisation** — three steps, pre-authentication. Never a
   registration form; the questions are asked like a conversation.

   **Step 1 — the fashion moment.** A full-bleed hero at the top of the screen:
   a pink gradient spanning the whole width with the shopping-spree cutout
   (straw hat, white sunglasses, red dress, paper bags) anchored to its bottom
   edge, plus a subtle pink wash over the photograph running diagonally from
   the top-right corner to the bottom-left. The headline, supporting
   line and **swipe-to-continue** sit on a bottom sheet whose top edge is a
   **full-width dome curve** — it climbs ~43dp from each side to its centre
   (SVG quadratic, not a corner radius), overlapping the photo, with a subtle
   drop shadow along the curve so it reads as an elevated edge. The sheet's
   own background is a subtle diagonal tint — background at the top-left,
   faint pink at the bottom-right — behind the content, never over it, and
   the dome curve carries the same diagonal so the curve is never an
   untinted white band. One
   word of the headline sits on a rotated accent pill
   (*"Get Ready For **Fashion** With Your Own Style"*). Three dots below mark
   the position in the flow.

   The swipe is deliberate and is the one control in the product that is not
   tapped. Onboarding is the moment where a user is being *shown* something, and
   a drag says "this moves, and so do you" in a way a tap does not — it is the
   physical difference between being told and being shown. It also means the first
   thing they learn about Wearly's gestures is that Wearly has gestures.

   Two constraints on it, both load-bearing:

   - **The track is a real control, not decoration.** Full travel is measured, not
     assumed; the thumb snaps back on a partial drag so the failure to complete is
     legible rather than silent; completion fires one haptic so success is felt as
     well as seen.
   - **Steps 2 and 3 keep their `Button`s.** A swipe gate on the step that asks a
     *question* would be hostile — the user has just been offered four answers and
     the only way forward is to discover a gesture. Swipe belongs to the screen
     that is pure introduction.

   Steps 2 and 3 are unchanged: "Who are we styling for?" (Women / Men / Kids /
   Everyone) and "What do you usually wear?" (Casual / Traditional / Party /
   Formal / Streetwear / Minimal), each a chip row with a Next / Start browsing
   button and a Skip. Answers are collectable **before** authentication, and are
   stored but never used to gate anything — a prototype that pretended to
   personalise a ranking it does not have would be exactly the fake social proof
   this spec forbids.
3. **Home → Explore → Browse → Product detail.** Fully usable.

### 6.1 No forced login

Browsing requires no account. Ask for authentication only at the moment an
action genuinely needs one:

- rent a piece
- save a favourite, if persistence needs an account
- message a lender
- publish clothing
- manage rentals
- complete payment

When it is needed, **explain why first** — "Create your Wearly account to
continue with your rental" — and never throw the user onto a generic login page.

### 6.2 Profile completion

Once an account exists, completion is progressive and always visible: a progress
indicator at the top, `10% → 25% → 40% …` and small positive messages ("Nice.
We're getting to know your style."). The psychology is *"I've already started"*,
not *"I have to fill out a huge form"*. Never manipulative.

---

## 7. Screens

### 7.1 Home

Not a traditional crowded e-commerce homepage. Do not immediately display dozens
of products. Curated and editorial:

greeting → personalised discovery → one or two large visual sections →
categories → curated clothing → trending/recommended.

Large visual cards, real whitespace. The user should feel *"let me explore"*,
not *"here is a giant product catalogue"*.

### 7.1b Home v3 — magazine marketplace (2026-10-05)

The third direction: Reference-2 editorial feeling + Reference-1 warmth and
usability + rental behaviour. "A fashion magazine you can rent from."

Rhythm (intentional, not banner → grid → grid):

INSPIRE (editorial hero, occasion-led, never discount-led) →
EXPLORE (categories, `✨ For You` first) →
IDENTIFY NEED (occasions: Wedding, Date Night, Party, Vacation, Brunch, Work,
Festival) → DISCOVER (Trending now rail) → RETURN (✨ New on Wearly rail) →
GET INSPIRED (Looks people are loving) → Recommended grid.

Rules: hero copy is editorial ("Wedding Season / Looks worth renting"), one CTA,
pink is accent only (80/15/5), product cards image-first with rental price
(`₹499 · 2 days`) + at most one social-proof fact, no fake counts, search on
Home navigates to Discover with query passthrough (no local filtering).

Home layout (2026-10-05): two full-bleed white cards separated by a `bg-muted`
gap — the header card on top (greeting + search, rounded on the bottom corners
only) and the content sheet below (rounded on the top corners only). The
header avatar shows the provider photo when there is one, falling back to the
name monogram. The
greeting scrolls away but the search strip stays pinned; at rest the two white
blocks read as one header card. The sheet holds everything else in the
existing order, followed by the recommended grid. Sheet bottom is flush
(`pb-0` scroll container + `px-5 pt-5 pb-4` inner, 2026-10-06) so no muted
gap sits between the last card and the tab bar. Surface tokens only
(`bg-muted` page/gap, `bg-card` cards, `border-border`), no custom colours;
the tab bar is unchanged.

### 7.2 Discovery

Search, categories, filters, discovery, saving. Search stays visually simple.
Filters are **not** a settings form — use bottom sheets, chips, large touch
targets, clear selections, simple hierarchy.

**One request owns the grid.** Discovery is a `POST /api/listings/discover`
because the search coordinate must not land in a URL or access log. The API
ranks and filters; the app renders its response and never re-filters locally,
so the distance rules cannot disagree with the screen.

**Location is opt-in, never a prompt on mount.** A card under the search field
explains the trade: *"Share a one-time location so pieces close to you come
first. It is not stored, and exact addresses are never shown."* The card offers
"Use my location" and "Not now". Denied or unavailable permission is not an
error state — the same grid works by area and text search, and the card says so.
Once a fix exists it collapses to a quiet row ("Sorted by distance within
5 km") with a "Stop using location" action.

**Filter speed.** The sheet opens with the calendar collapsed: "Available from"
is a compact tappable row (Any date / From 12 Mar) that expands the calendar
only when tapped, so the day-grid cells never lay out on open. Groups are
memoised with stable callbacks, so tapping one chip re-renders only its own
group rather than the sheet. The footer button during an in-flight re-query
shows a small spinner and reads "Updating…" — the count only ever drops when
results genuinely change.

Distance is a ranking signal, not a filter: the bands are progressive and a
listing without coordinates still appears by area label. Cards show **one extra
fact** — the rounded band, otherwise the public area, otherwise the category.
There is never a pin, a map or an address.

**Condition vocabulary.** One canonical set everywhere — `CONDITION_VALUES` in
`packages/shared/enums/condition.ts` — accepted by `createListingSchema`, stored
after backfill, and displayed through the mobile `CONDITION_LABEL` map
(`conditionLabel()` renders "Not stated" for a missing one). Legacy stored
values ("Good", "Excellent", "Brand New with Tags", the old "good-condition" /
"like-new" seeds) are translated on read; unrecognised strings are never
guessed — they render as "Not stated". The condition filter values are the
canonical enum, so a filter always matches what is stored.

### 7.3 Product detail — the most important screen

Premium and immersive. Large photography, name, rental price, duration,
availability, size, condition, owner, reviews, and the lender's **public area
plus approximate distance** (`48 m away`, `1.2 km away`, or just
`Bandra West` when they did not share a location). Do not expose everything at
once — use sections and progressive disclosure. The primary CTA (`Rent this`)
stays accessible while scrolling.

**Condition badge and truthfulness.** The condition badge on the header is
rendered only when the listing states a condition — an unstated condition is
honest silence ("Not stated" in the fit section), never an empty pill. An
unpublished listing hides the sticky "Rent this" CTA, and a saved listing that
is no longer published shows a "No longer available" notice on its card.

**In-person only in this phase.** The detail screen never offers a delivery
option and never shows a delivery fee or a deposit. The lines under the price
read **"In Bandra West · 50–100 m away · Meet in person"** (area and band are
omitted when unknown), and the "Good to know" section states that you meet at a
public place, that exact addresses are never shared, and that payment protection
is not connected in this build. The lender's photo renders in the "Who you are
renting from" card when the API provides one; a lender without a photo gets a
monogram, never a broken image.

The distance band is relative to the renter's search position, so Discover
hands it to the detail route as a parameter; the detail endpoint cannot know it.
No coordinates travel with it — only the band and the API-rounded distance.

Distance is a ranking hint, not a promise of proximity: it is rounded, it is
never accompanied by a pin or a map, and it disappears when the renter has not
shared a location.

Structure: a full-bleed 3:4 photograph leads, with the header row (back ·
centred "Product Details" title · favourite) floating over its top. The
content below is a sheet that overlaps the photograph's bottom edge slightly
and carries the Home sheet's top corner radius (`rounded-t-5xl`). The
photograph is fixed behind the sheet and drifts upward with a parallax lag
as the sheet slides over it; scrolling back down uncovers it again. The
header row (back · title · favourite) stays fixed
above the scrolling sheet: it starts empty over the hero and shows the piece
name once the in-content title has scrolled past it, clearing again when
scrolled back. The earlier
three-frame gallery strip was removed — one composed image leads, and
everything below keeps its place in the flow.

### 7.4 Rental flow

The exchange happens in person. Every stage answers three questions: what is
happening, who needs to act, and what happens next.

```
Product → Choose dates → Review request → Authentication (only if needed)
        → Request sent → Lender accepts → Propose a public meetup
        → Meetup scheduled → Check in → Inspect the piece
        → Renter confirms receipt → Rental active
        → Return by the due date → Lender confirms → Completed
```

Acceptance is **not** a handover. A rental never becomes active, and the renter
is never charged, merely because the lender said yes. Only the renter confirming
they physically received the piece activates the rental.

Do not add unnecessary steps. Do not add a chat system, a map, or a delivery
address in this phase.

#### Meetup — a public place, agreed together

After acceptance either party proposes a **public place** (café, mall, station),
an area label and a time; the other party accepts or counter-proposes. The UI
repeats the rule in plain words: *"Meet somewhere public. Never share your home
address."* There is no map pin and no coordinate entry. `MEETUP_PENDING` shows
the pending proposal with **Accept** and **Suggest another place**;
`MEETUP_SCHEDULED` shows the confirmed place, time and a **Check in when you
arrive** action.

#### Handover — the renter decides

At the meetup the renter inspects the piece and then confirms receipt. The
confirmation sheet is explicit: condition accepted and item received are both
ticked, the rental clock start is stated, and the payment step (once a provider
exists) is named. Only then does the rental become **Active**.

The lender gets a one-tap **I handed it over** acknowledgement. It is recorded
in the timeline and is never required for activation. If the piece does not
match the listing, the renter reports the problem from the same screen and the
rental moves to **Disputed** with no capture.

#### Return and completion

The detail screen shows the return date, computed from the actual handover, not
from the originally chosen start day. The renter marks the piece returned after
the in-person hand back; the lender confirms and the rental completes. No
deposit is held and no payout is shown in this phase.

#### Cancellations, no-shows and disputes

Cancelling before activation is always available to both parties, with a reason.
Declining, cancelling or letting a request expire voids the payment
authorization. A party who is not met can report a no-show once the meetup time
plus a 30-minute grace period has passed. Every exception state has its own
honest explanation and a single next step; none of them pretends the rental is
active.

### 7.5 Date selection — a core interaction

A beautiful calendar. Clearly communicate start date, end date, duration,
availability and price. Selected dates are visually obvious. Smooth
interactions.

The calendar reflects the lender's blocked days — a day is unavailable because
the lender marked it blocked, never because the app guessed. The chosen window
is the **intended** rental window; the real return date starts at handover and
is shown that way.

The footer quote comes from the same shared pricing function the review screen
uses: rental, cleaning (included), total. **No deposit row**. When no dates are
chosen the total reads "—" rather than a guessed number.

No native header on this screen — the Stack header is off for the route, and
an in-screen row carries the back button and the centred step title
**"Choose dates"**. The editorial question *"When will you wear it?"* leads
the scroll beneath it.

### 7.6 Review request — simple and trustworthy

Item, duration, rental cost, cleaning fee, total, and how the handover works.
**No surprise charges** — the user knows exactly what they are agreeing to
before sending. No deposit line and no delivery option in this phase.

Like dates, the native Stack header is off for the route; an in-screen row
carries the back button and the centred step title **"Review request"**.

Payment honesty is part of the screen, not a footnote:

> Payment protection is not connected in this build. No money has been taken or
> reserved. Your request will be sent to the lender and you'll agree on a public
> meetup.

When a provider is connected the same block becomes the authorization summary.
The layout and the rental lifecycle stay identical — only the payment block
changes.

**Signed-out renters** are asked to sign in at this point and returned to the
same request, with the chosen dates intact.

### 7.7 List your clothing

Wearly is two-sided. A simple guided flow — photos, name/category, size,
condition, description, rental price, availability, location, preview, publish.
Friendly and guided, never a seller dashboard.

**Location is two fields, and they mean different things.** The public
`areaLabel` ("Bandra West") is what renters see, and the details step requires
it. The private coordinates are optional, never displayed, and used only to
rank the listing in nearby discovery. The field hint reads *"Public. Your exact
address is never shown."*; the success line reads *"Location added — used only
to rank you nearby."* Declining location still publishes the listing; it is
discoverable by area and search, just without a distance, and the screen says
so.

`availability` is captured as **blocked days**. Pickup and delivery toggles are
removed from this flow; every listing is in-person for now, and the model keeps
room for delivery later.

### 7.8 Trust

Trust is communicated through **consistency, transparency and predictability**:
clear pricing, clear duration, clear condition, owner information, verification
where applicable, reviews, policies, transparent review, predictable
navigation — and, for in-person rentals, a meetup rule that is stated every
time a place is proposed.

> **Hard rule.** Do **not** invent fake user counts, fake reviews, fake ratings
> or fake marketplace activity. If the marketplace is empty, the interface is
> still trustworthy through quality and transparency — an honest empty state is
> always better than fabricated social proof. All data in this repository is
> prototype data and is labelled as such in the UI.

The same rule applies to payments: never display "Paid", "Protected" or "Refunded"
while the provider is a placeholder.

### 7.9 My rentals

Two roles, one screen: **Renting** (pieces the user borrowed) and **Lending**
(pieces the user shared), switchable, each grouped into upcoming, active and
past. Every card carries the piece, the counterparty, the dates and one clear
status line — *Waiting for lender*, *Agree on a meetup*, *Meet Priya at Blue
Tokai*, *Active until 22 Nov*, *Return due today*, *Completed*.

The card's primary action is whatever the server-computed capabilities allow:
accept or decline, propose or accept a meetup, check in, confirm receipt, mark
returned, confirm return. The app never derives these from the status in the
screen; it renders what the API returned. Large cards, clear status indicators.
Not a dashboard.

### 7.10 Profile

Profile image, name, verification status where applicable, style preferences,
rentals, listings, saved items, settings. Clean.

**Phase 1 (implemented).** Order top to bottom: identity (provider photo or a
rose monogram, display name, account email — no "account created" badge, no
header edit action; editing lives in Account), a
compact completion bar that counts only achievable steps and can reach 100%,
the style answers when they exist, the saved-pieces grid, a "Lend with Wearly"
invitation to the List destination, then Account (photo upload/change/remove,
edit display name, sign out with confirmation) and About (help, configured
legal links, app version).

Accounts created with email and password start without a photo — the monogram
is the honest default. The Account group therefore carries a "Profile photo"
row (every signed-in user, including OAuth ones who may prefer their own shot)
which opens a sheet: choose from gallery or take a photo (square crop,
`allowsEditing`), uploads through the same signed-URL pipeline as listing
photos into the existing public bucket under an `avatars/` prefix, and saves
via Better Auth `updateUser({ image })`. Removing sets `image` back to `null`
and the monogram returns. Failures surface as a toast; the session is
re-fetched after every change so all screens read the new photo from one
source.

Saved pieces are device-local and the screen says so; it never implies account
sync. Privacy and terms rows appear only when `EXPO_PUBLIC_PRIVACY_URL` /
`EXPO_PUBLIC_TERMS_URL` are configured — no placeholder is presented as an
official policy. Phase 2/3 destinations (rentals, listings, addresses,
notifications, payments) are not shown until their infrastructure exists; see
`docs/PROFILE_PHASES.md`.

### 7.11 Empty states

No blank screens, ever.

| Context | Copy |
| --- | --- |
| No rentals | "Your wardrobe adventures start here." |
| No saved items | "Nothing saved yet." |
| No listings | "Have something beautiful to share?" |

Subtle illustration or visual element where it helps.

---

## 8. Accessibility and responsiveness

**Responsive** — mobile-first, designed for modern smartphone dimensions, but
components must not break at other viewport sizes.

**Accessibility** — even though the design is soft and premium:

- readable text and sufficient contrast (WCAG AA, both themes)
- large touch targets (44px minimum, 52px for primary actions)
- never colour alone to convey state
- clear button labels
- understandable navigation

Premium never means difficult to use.

---

## 9. Do not overdesign

**Do not add:** random gradients · excessive glassmorphism · excessive shadows ·
excessive animation · unnecessary decoration · too many floating buttons, cards,
badges or body text · fake statistics · fake reviews · fake marketplace
activity.

The target is **quietly premium**.

---

## 10. Data

Realistic prototype data is required. Clothing items carry: name, category,
price, rental duration, size, condition, owner, availability, imagery.

The repository holds **prototype data only**. Nothing is a real user or a real
listing, and the UI says so. See §7.8.

---

## 11. Build status

Prototype built in phases, so design feedback lands before everything is built.
The live tracker with per-screen checkboxes is `docs/SCREENS.md`.

### Phase 1 — foundation + 5 signature screens *(this build)*

Proves the design language and the signature interaction end to end.

| # | Screen | Notes |
| --- | --- | --- |
| 01 | Splash | Animated brand moment |
| 02 | Home | Editorial, curated |
| 03 | Discover + filters | Bottom-sheet filters, chips |
| 07 | Product detail | Hero expansion from the card |
| 13 | Checkout | Transparent price breakdown |

Plus the connective tissue that keeps the above navigable end to end: welcome /
personalisation, bottom tab bar, calendar, the explain-first auth gate, rental
confirmation, and honest empty states for Rentals and Profile.

### Phase 2 — the rest of the rental journey

Categories · size selection · availability · in-person request, meetup,
handover and return · reviews · seller profile · profile completion.

Payment is scaffolded only: the provider interface and payment state exist, but
no money moves and the UI says so. Delivery, tracking, deposits and payouts stay
out of this phase.

### Phase 3 — the listing flow

Add clothing · upload photos · listing details · listing preview · publish
confirmation.

**Not in Phases 2–3:** 04 categories screen, 05 standalone product grid (the
grid ships inside Home and Discover), 08 dedicated image gallery (the gallery
ships inside product detail), 14 payment, 17 tracking, 19 reviews, 20 seller
profile, 21–25 listing flow. `docs/SCREENS.md` carries the per-screen boxes.

---

## 12. Deviations from `AGENTS.md` (deliberate, prototype-only)

Recorded so the next contributor can tell an intentional choice from a mistake.

| `AGENTS.md` says | Prototype does | Why |
| --- | --- | --- |
| Toast via `sonner` | Custom `ui-native` `Toast` on mobile (`toast.tsx` + `toast-view.tsx` + `toast-motion.ts` + `toast-drag.ts`); `sonner` on web | HeroUI Native's toast cannot be imported without its absent peer deps (`DESIGN_SYSTEM.md` §16); the shared, token-based surface is the infrastructure instead. |
| Global state via `zustand` | Context + `useReducer` | One small session surface. Zustand is unjustified at this size. |
| All API calls via React Query | No network layer | The prototype is mock data. Adding a query client to fetch nothing is cargo cult. |
| Every input: `zod` + `react-hook-form` + `sonner` | `zod` + `react-hook-form` + `useToast` / `sonner` | Same guarantee, existing shared dependency. |
| 80% test coverage | None | **Not met.** The repository has no test runner at all. Verification is typecheck + lint + `expo export`. Flagged, not ignored. |
| Flexbox only, never absolute | One absolute layer | The hero-expansion overlay is a transient animation layer, not layout. See `DESIGN_SYSTEM.md` §10. |

---

## 13. Change log

| Date | Change |
| --- | --- |
| 2026-11-23 | Filter behaviour fixed (§7.2): `use-discover-listings` keeps the previous result (`placeholderData: keepPreviousData`) while re-querying — the footer button shows a small spinner and reads "Updating…" instead of "Show 0 pieces", and the grid keeps previous results rather than flashing a full-screen spinner. §7.2. |
| 2026-11-23 | Condition vocabulary lands as one enum (`packages/shared/enums/condition.ts`): canonical five values, legacy values translated on read (`normaliseCondition`), filter values match stored data, unknown strings read as "Not stated"; unstated badges are hidden rather than empty; the hardcoded `Care: Dry clean only` row is removed from the product page. §7.2–7.3. Rental and rentals cards (§7.3, §7.9): renter avatars replace the missing counterparty photos, so Activity and Rentals list is no longer missing renderer for the counterparty. Button width contract: see `DESIGN_SYSTEM.md` §9.4 — row buttons size to their labels, fixing the tall Activity/Rentals cards. Product page lender card shows the lender photo when the API provides one (`piece.lender.image`), with the Avatar initials fallback otherwise. Saved-pieces architecture: local storage while a guest; account via `GET /api/favourites` + `POST /api/favourites/merge` on sign-in; sign-out empties the device; the "No longer available" notice on the product grid comes from unpublished saved listings. |

| 2026-11-19 | Mobile Phase 2a UI completed: request-sent screen, capability-driven rental detail with sheets, rentals list, opt-in nearby discovery on `POST /api/listings/discover`, area + rounded band on cards and detail, listing area/optional location, and removal of delivery/deposit copy and device-local confirmed rentals. §7.2–7.7. |
| 2026-11-18 | Rental flow rewritten for peer-to-peer in-person handover: delivery and delivery fees removed, public-area + rounded distance replaces any address, request/review/meetup/handover/return stages defined, renter-confirmed handover is the only path to Active, and payment is documented as an honest placeholder. §7.3–7.9, §11. |
| 2026-11-17 | Onboarding step 1 restructured to the reference layout: full-bleed hero (pink gradient backdrop across the whole top, cutout subject anchored to its bottom edge, subtle wash kept over the photograph) and the headline/description/swipe block moved onto a bottom sheet whose top edge is a full-width dome curve (~43dp rise from each side to the centre, SVG-drawn) overlapping the photo; the sheet's background is a subtle diagonal tint (background top-left → faint pink bottom-right) behind the content, and the curve carries a subtle drop shadow as an elevated-edge cue. Headline, supporting line, swipe-to-continue and step dots are untouched. §6. |

| 2026-11-17 | Onboarding sheet's top padding tightened `pt-4` → `pt-2` so the headline sits closer beneath the dome curve — the white gap above "Get Ready For" is halved. §6. |
| 2026-10-24 | Mobile email verification redesigned as a full OTP screen: six token-styled slots, outline back control, 40s resend countdown, primary verify button, bottom custom keypad; preserves 6-digit Better Auth flow and legacy link states. |
| 2026-10-22 | Home greeting drops the fabricated guest name ("Romina") for the on-theme "Stylist", and the avatar no longer seeds initials for a guest. §7.1. |
| 2026-10-21 | Web toasts rebuilt as the mobile brand pill (card surface, neutral hairline border, pill radius, rose disc with a white icon, tone carried by icon alone), and the token reference gained a Toasts section that fires each tone. See `DESIGN_SYSTEM.md` §9. |
| 2026-10-18 | Mobile toast rebuilt as a brand pill (white `bg-card`, neutral hairline `border-border`, `rounded-pill`, `shadow-float`, rose disc with a white icon) with four tones — success, error, warning, information — told apart by icon and spoken label, plus optional `duration` and `persistent` per message. See `DESIGN_SYSTEM.md` §9. |
| 2026-10-17 | Toasts made on-theme and rounded on both platforms, and mobile toasts gained swipe-to-dismiss. See `DESIGN_SYSTEM.md` §9 for the skin contract and the change-log entry for the mechanism. |
| 2026-10-15 | Rent dates screen header clarified: native Stack header off (`headerShown: false`, the route is a modal), in-screen row carries outline back · centred `headingSm` "Choose dates" · `size-12` mirror spacer; headline reworded "When do you need it?" → "When will you wear it?". §7.5. |
| 2026-10-15 | Rent checkout gets the same header contract as dates: `headerShown: false` in the root layout, in-screen row with outline back · centred `headingSm` "Checkout" · `size-12` mirror spacer above the scroll. §7.6. |
| 2026-10-15 | Auth `/auth` headings reworded as semi-titles: Log In → "Welcome back - the next look is waiting", Sign Up → "Rent designer looks - no closet required", both smaller (`headingSm`) under a banner row that now carries the `Wearly` lockup beside the back button (matching `/sign-in`). |
| 2026-10-04 | Onboarding step 1 redesigned as the fashion moment (full-bleed hero, headline with a rotated accent pill, swipe-to-continue instead of Next). Steps 2 and 3 are untouched. §6. |
| 2026-09-29 | Initial spec. Normalised from the original brief; added build phases (§11) and the deviations log (§12). |
