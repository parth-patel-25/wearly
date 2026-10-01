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

1. **Splash** — animated. Logo, custom visual asset, soft pink/warm background,
   subtle animation, smooth transition into the app. In the spirit of a warm
   emotional brand introduction, but with its own identity and assets. It must
   feel like *"Welcome to Wearly"*, not *"Please create an account"*.
2. **Welcome / personalisation** — a friendly conversation, not a registration
   form. Two questions maximum, e.g. "Who are we styling for?" (Women / Men /
   Kids / Everyone) and "What do you usually wear?" (Casual / Traditional / Party
   / Formal / Streetwear / Minimal). Collectable **before** authentication.
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

### 7.2 Discovery

Search, categories, filters, discovery, saving. Search stays visually simple.
Filters are **not** a settings form — use bottom sheets, chips, large touch
targets, clear selections, simple hierarchy.

### 7.3 Product detail — the most important screen

Premium and immersive. Large photography, name, rental price, duration,
availability, size, condition, owner, reviews, location/delivery, deposit,
policies. Do not expose everything at once — use sections and progressive
disclosure. The primary CTA (`Rent this`) stays accessible while scrolling.

### 7.4 Rental flow

```
Product → Choose dates → Review rental → Delivery/pickup → Price summary
        → Authentication (only if needed) → Payment → Confirmation
```

Do not add unnecessary steps.

### 7.5 Date selection — a core interaction

A beautiful calendar. Clearly communicate start date, end date, duration,
availability and price. Selected dates are visually obvious. Smooth
interactions.

### 7.6 Checkout — simple and trustworthy

Item, duration, rental cost, deposit, delivery/pickup, fees, total. **No
surprise charges** — the user knows exactly what they are paying before
confirming.

### 7.7 List your clothing

Wearly is two-sided. A simple guided flow — photos, name/category, size,
condition, description, rental price, availability, pickup/delivery, preview,
publish. Friendly and guided, never a seller dashboard.

### 7.8 Trust

Trust is communicated through **consistency, transparency and predictability**:
clear pricing, clear duration, clear condition, owner information, verification
where applicable, reviews, policies, transparent checkout, predictable
navigation.

> **Hard rule.** Do **not** invent fake user counts, fake reviews, fake ratings
> or fake marketplace activity. If the marketplace is empty, the interface is
> still trustworthy through quality and transparency — an honest empty state is
> always better than fabricated social proof. All data in this repository is
> prototype data and is labelled as such in the UI.

### 7.9 My rentals

Upcoming, active and previous rentals; return status, delivery status, rental
dates. Large cards, clear status indicators. Not a dashboard.

### 7.10 Profile

Profile image, name, verification status where applicable, style preferences,
rentals, listings, saved items, settings. Clean.

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

Categories · size selection · availability · price breakdown as its own screen ·
payment · tracking · reviews · seller profile · profile completion.

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
| Toast via `sonner` | HeroUI Native `toast` | Already a dependency. A second toast system would be duplicate infrastructure. |
| Global state via `zustand` | Context + `useReducer` | One small session surface. Zustand is unjustified at this size. |
| All API calls via React Query | No network layer | The prototype is mock data. Adding a query client to fetch nothing is cargo cult. |
| Every input: `zod` + `react-hook-form` + `sonner` | `zod` + `react-hook-form` + HeroUI `toast` | Same guarantee, existing dependency. |
| 80% test coverage | None | **Not met.** The repository has no test runner at all. Verification is typecheck + lint + `expo export`. Flagged, not ignored. |
| Flexbox only, never absolute | One absolute layer | The hero-expansion overlay is a transient animation layer, not layout. See `DESIGN_SYSTEM.md` §10. |

---

## 13. Change log

| Date | Change |
| --- | --- |
| 2026-09-29 | Initial spec. Normalised from the original brief; added build phases (§11) and the deviations log (§12). |
