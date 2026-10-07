# Wearly design system

**Soft fashion · modern editorial · minimal · premium · rounded**

Wearly is a clothing rental marketplace. Renters browse, request and return
garments; owners list what they own and approve rentals; admins moderate the
marketplace. Every surface should feel calm, airy and quietly expensive —
closer to a fashion editorial than to a SaaS dashboard.

The system is not "web with a mobile port". Web and mobile are two native
experiences that happen to share a brand:

```
              SHARED DESIGN TOKENS
                       │
          ┌────────────┴────────────┐
          │                         │
       WEB/ADMIN                 MOBILE
          │                         │
      shadcn/ui                HeroUI Native
          │                         │
      Tailwind                  Uniwind
          │                         │
          └────────────┬────────────┘
                       │
                SAME BRAND
                SAME TOKENS
                SAME VISUAL LANGUAGE
```

---

## 1. Philosophy

Four words carry most of the decisions.

**Soft.** No harsh borders, no pure black, no sharp corners, no heavy shadows.
Surfaces are separated by a hairline and a small step in tone; shadows are
reserved for things that genuinely float.

**Minimal.** Hierarchy comes from spacing, scale and contrast — not decoration.
No gratuitous gradients, glassmorphism, blob backgrounds or illustrations.
Restraint is what makes it read as premium.

**Fashion-forward.** Photography leads. On a product card the image is the
largest element and the metadata is capped at three facts. If a card needed
another line of text, the answer is usually to remove one that already exists.

**Generous.** The product should feel airy. When a layout feels tight, add a
spacing step rather than shrinking type.

### The 80 / 15 / 5 rule

Roughly **80% neutral** surfaces, **15% brand rose**, **5% status colour**. Rose
is an accent. If a screen reads as pink, something has gone too far.

---

## 2. Architecture

Everything lives in `packages/design-tokens`. Nothing else defines a colour, a
radius, a font size or a duration.

| File | Responsibility |
| --- | --- |
| `colors.css` | The semantic palette. Light and dark, declared as symmetric `@variant` blocks. |
| `radius.css` | The radius scale plus per-component radius defaults. |
| `spacing.css` | The 4px scale plus named layout roles. |
| `typography.css` | The Satoshi stack, the weights, and the semantic type scale. |
| `shadows.css` | Control heights and padding. |
| `motion.css` | Durations and easings. |
| `theme.css` | Maps everything above onto Tailwind / Uniwind utility names. |
| `heroui.css` | Bridges onto HeroUI **web** variable names. |
| `heroui-native.css` | Bridges onto HeroUI **Native** variable names. |
| `index.css` | Ordered barrel — import this. |

### Why `@variant` and not `:root` + `.dark`

A bare `.dark { --token: … }` block looks correct and works on the web, but on
React Native it is dead. Uniwind's CSS processor treats a lone `.dark` selector
as a *utility class name*, so those declarations never enter the theme scope
and the app stays light. The working form is:

```css
@layer theme {
  :root {
    @variant light { --wearly-background: …; }
    @variant dark  { --wearly-background: …; }
  }
}
```

Both blocks are also required to declare an **identical set of variable names**.
Uniwind's `generateCSSForThemes` logs `Theme light is missing variable …` and
bails out of theming otherwise. This is why the elevation tokens sit in
`colors.css` rather than `shadows.css`.

On the web, `@variant light` and `@variant dark` need matching `@custom-variant`
declarations; `next-themes` always emits the resolved theme as a class on
`<html>`, so `.light` and `.dark` are both present.

### Import order

```css
@import "tailwindcss";        /* Tailwind must be first */
@import "./fonts.css";        /* @font-face, before the stack that uses it */
@import "@heroui/styles";     /* HeroUI's own variables… */
@import "@wearly/design-tokens/…"; /* …overridden by ours */
@import "@wearly/design-tokens/heroui.css"; /* unlayered, so it wins */
```

`heroui.css` must come last and stay unlayered: unlayered declarations outrank
the `@layer base` / `@layer theme` variables HeroUI ships with.

### Two things that are easy to get wrong

**`@source`.** `packages/ui` and `packages/ui-native` live outside their apps, so
Tailwind's automatic source detection never sees them and their components ship
with no CSS at all. Both entry stylesheets declare an explicit `@source`.

**Font delivery.** `next/font` emits a build-hashed family name
(`__Satoshi_xxxx`) and exposes it only through a CSS variable, which React
Native cannot resolve. The font is therefore self-hosted with a hand-written
`@font-face` so the family is literally `"Satoshi"` on both platforms, and one
token name means the same thing everywhere. Web preload hints are declared by
hand in the root layout as the trade-off.

---

## 3. Colour

### Light

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#FFFBFC` | Page canvas |
| `foreground` | `#272126` | Body text |
| `card` / `card-foreground` | `#FFFFFF` | Raised surfaces |
| `primary` / `primary-foreground` | `#C54B75` / `#FFFFFF` | Fills that carry white text |
| `brand` / `brand-foreground` | `#E86A93` / `#272126` | Decorative by default — rings, indicators, hearts |
| `secondary` | `#F9EEF2` | Neutral fill |
| `muted` | `#F8F2F5` | Subtle fill, skeleton base |
| `muted-foreground` | `#7E7178` | Secondary text, captions |
| `accent` / `accent-foreground` | `#FCE7EF` / `#7A304D` | Soft rose action |
| `border` / `input` / `ring` | `#F0E3E8` / `#F0E3E8` / `#C54B75` | Hairlines and focus |
| `backdrop` | `#272126` @ 32% | Dialog scrim |

### Dark

A dedicated palette, not an inversion. Anchored on `#171316` — never `#000` —
with a vivid rose that holds contrast against it. Surfaces read through their
borders, so shadows recede rather than deepen.

The two rose tokens behave differently on purpose:

| Token | Dark value | Foreground | Why |
| --- | --- | --- | --- |
| `primary` | `#C54B75` — **same as light** | `#FFFFFF` | Text-bearing fill. Kept identical in both themes so `primary-foreground` is white everywhere and a filled button looks the same either way. |
| `brand` | `#F09BB8` — lightened | `#3D1526` | Decoration only. The pale rose keeps its glow on charcoal (8.84:1) but is far too light for white (2.08:1). |

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#171316` | Page canvas |
| `foreground` | `#F5EFF2` | Body text |
| `card` / `card-foreground` | `#211D20` / `#F5EFF2` | Raised surfaces |
| `primary` / `primary-foreground` | `#C54B75` / `#FFFFFF` | Fills that carry white text |
| `brand` / `brand-foreground` | `#F09BB8` / `#3D1526` | Decoration, rings, hearts |
| `muted-foreground` | `#A99BA3` | Secondary text, captions |

Because `brand` is light in dark mode, painting a brand background without its
paired foreground leaves light text on a light surface — **1.28:1**, far below AA.
Use the paired token; see [`Card` variants](#card-variants) below.

### Two deliberate deviations from the brief

Both preserve the intended hue and were required to pass WCAG AA.

| Token | Brief | Shipped | Why |
| --- | --- | --- | --- |
| `primary` | `#E86A93` | `#C54B75` | White text on `#E86A93` is **3.04:1**. A 15px button label is not "large text", so it needs 4.5:1. The vivid pink is still available as `brand` for decoration. |
| `muted-foreground` | `#8D8087` | `#7E7178` | 3.77:1 → **4.53:1** on the page background. |

The rule this encodes: **the default token is the accessible one.** A developer
who reaches for `bg-primary` cannot accidentally build an unreadable button. The
decorative brand tone has a separate, explicitly named token.

`brand-foreground` is a third such pairing, added after the showcase page proved
the "no text on `brand`" convention could not be enforced by a comment alone:

| Token | Light | Dark | Contrast on `brand` |
| --- | --- | --- | --- |
| `brand` | `#E86A93` | `#F09BB8` | — |
| `brand-foreground` | `#272126` | `#3D1526` | 5.19:1 light · 7.56:1 dark |

Note it is **not** the same token as `primary-foreground`, and the two roses
diverge further in dark mode:

| | Light | Dark |
| --- | --- | --- |
| `primary-foreground` on `primary` | `#FFFFFF` · 4.53:1 | `#FFFFFF` · 4.53:1 |
| `brand-foreground` on `brand` | `#272126` · 5.19:1 | `#3D1526` · 7.56:1 |

**White is reserved for `primary`.** Reusing it on `brand` would land at 3.04:1 in
light mode and 2.08:1 in dark. If you need a rose fill that carries white text,
use `bg-primary` — that is exactly what it is for.

### `Card` variants

`Card` is the one component that historically hardcoded its background and
foreground together in a single base class. A caller overriding only the
background left the light-on-light pairing behind. It now uses `cva`, so the
pairing travels with the surface:

| Variant | Classes | Intended for |
| --- | --- | --- |
| `default` | `bg-card text-card-foreground` | The normal product surface |
| `primary` | `bg-primary text-primary-foreground` | Filled promotional card |
| `brand` | `bg-brand text-brand-foreground` | Filled brand card; also re-tints `CardDescription` |

Prefer a variant over a raw `className="bg-brand"`. Overriding the background by
hand remains possible, but it is no longer a documented path — if you need a fill
the variants do not cover, add a variant.

### Status

Each status has three tones, and they are not interchangeable:

| Token | Role |
| --- | --- |
| `--wearly-success` | Dots, icons, small fills |
| `--wearly-success-foreground` | The **only** tone valid for text |
| `--wearly-success-background` | The soft surface they sit on |

In light mode the mid tone clears 4.5:1 on its soft background but not on white,
which is why badges are built as `bg-*-background text-*-foreground` rather than
a filled pill with white text. In dark the mid and foreground tones converge,
since both clear 6.4:1 on their own surface.

| Status | Foreground | Background |
| --- | --- | --- |
| success | `#437B5E` | `#EDF7F1` |
| warning | `#9C651A` | `#FFF5E8` |
| destructive | `#B94656` | `#FDECEF` |
| info | `#5071A0` | `#EEF4FC` |

---

## 4. Typography

Satoshi, by Indian Type Foundry. Self-hosted; see the licence note below.

**Satoshi has no 600 weight.** The scale uses **500 for headings** and 700 for
emphasis, and `--wearly-weight-semibold` is deliberately *not* defined so nobody
reaches for a weight that does not exist. Large headings set in 500 also read
more editorial than bold.

| Token | Size | Weight | Use |
| --- | --- | --- | --- |
| `text-display` | 36–44px | 500 | Hero |
| `text-display-sm` | 32px (native) | 500 | Hero, onboarding headline |
| `text-display-xs` | 28px (native) | 500 | Fashion pill |
| `text-heading-xl` | 30–36px | 500 | Page title |
| `text-heading-lg` | 24–30px | 500 | Section title |
| `text-heading-md` | 24px | 500 | Subsection |
| `text-heading-sm` | 20px | 500 | Card title |
| `text-body-lg` | 17px | 400 | Lead paragraph |
| `text-body-md` | 15px | 400 | Default body |
| `text-body-sm` | 14px | 400 | Secondary text |
| `text-label` | 13px | 500 | Form labels |
| `text-caption` | 12px | 400 | Metadata |

Web sizes are `clamp()`-based so headings never overflow a phone or look lost on
a large display. React Native cannot resolve `clamp()`, so each step has a
`--wearly-text-native-*` counterpart at the fluid scale's floor. Using a web
`clamp()` in a native `className` would silently resolve to garbage.

Control labels get their own `text-button` / `-sm` / `-lg` steps. Combining
`text-body-sm` with `font-medium` looks right but both utilities set
`font-weight`, and which wins depends on stylesheet order rather than class
order — a silent way to ship the wrong weight.

---

## 5. Radius

The most recognisable part of the silhouette. `rounded-sm` is 12px, not
Tailwind's 4px default.

| Token | Value |
| --- | --- |
| `radius-xs` | 8px |
| `radius-sm` | 12px |
| `radius-md` | 16px |
| `radius-lg` | 20px |
| `radius-xl` | 24px |
| `radius-2xl` | 28px |
| `radius-3xl` | 32px |
| `radius-4xl` | 40px |
| `radius-5xl` | 48px |
| `radius-6xl` | 56px |
| `radius-pill` | 9999px |

**Prefer the component names** over the numeric scale — re-theming one component
is then a single token change:

| Utility | Value | Used by |
| --- | --- | --- |
| `rounded-button` | pill | Buttons |
| `rounded-badge` | pill | Badges, chips, icon buttons |
| `rounded-input` | 16px | Inputs, selects |
| `rounded-search` | pill | Search fields |
| `rounded-card` | 24px | Cards |
| `rounded-media` | 20px | Product imagery |
| `rounded-dialog` | 28px | Dialogs |
| `rounded-sheet` | 32px | Bottom sheets, promotional blocks |

Not everything is a pill. Pills are for controls and small chips; cards,
imagery and sheets use the scale. Making every element pill-shaped flattens the
hierarchy.

---

## 6. Spacing

A 4px base: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

Tailwind's numeric scale derives from `--spacing: 0.25rem`, so `p-4` is 1rem on
both platforms. Three named roles exist so screens do not each invent a rhythm:
`gap-gutter`, `gap-section`, `px-page-inline`. `gutter` and `page-inline` widen at
the `md` breakpoint. Screen gutters must use the reusable `px-gutter` /
`mx-gutter` role (16px on mobile) — never a hardcoded `px-4` or `px-[16px]`.

Heights: `h-9` 36, `h-11` 44 (the WCAG 2.2 minimum target), `h-12` 48,
`h-13` 52 for mobile primary actions.

Mobile screens use `px-gutter` (16px) for the outer frame, matching `Screen`'s
`p-gutter` and the Home rhythm — including `welcome` (all three steps). `px-page-inline`
(24px, 40px at `md`) is web/marketing only.

---

## 7. Elevation

Barely noticeable by design.

| Utility | Value | Used by |
| --- | --- | --- |
| `shadow-soft` | `0 1px 3px` @ 5% | Cards, resting surfaces |
| `shadow-raised` | `0 4px 16px -2px` @ 7% | Hovered, draggable |
| `shadow-float` | `0 8px 30px -6px` @ 10% | Dialogs, sheets, sticky bars |
| `shadow-lift` | `0 16px 48px -8px` @ 18% | Sheets overlapping photography |

Shadows are rose-tinted so they never read as cold grey. If a card needs a
strong shadow to be readable, the problem is its border or surface contrast,
not the shadow. React Native supports one shadow per view, so native surfaces
rely on `border` plus tone.

---

## 8. Motion

| Token | Value |
| --- | --- |
| `duration-fast` | 150ms |
| `duration-base` | 200ms |
| `duration-slow` | 300ms |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

Small interactions (press, focus, favourite heart) run 150–200ms. Larger
transitions (dialog, sheet) run 200–300ms. Everything eases out, which
decelerates into rest and reads as calm rather than springy.

Buttons animate colour only — no transform — so press feedback never shifts
surrounding layout. Icons that do scale use `active:scale-95` paired with
`motion-reduce:active:scale-100`.

`prefers-reduced-motion: reduce` collapses every duration to 1ms in both
`theme.css` and `globals.css`, so state changes stay legible without movement.

### Splash choreography (feature-level, not tokens)

The splash timeline lives in `features/splash/splash-timing.ts`, not in the
token layer: it choreographs one screen (~1.8s), it is not a reusable
duration. It honours the same ease-out curve and the same reduced-motion rule
— under reduced motion the fabric wipe, settle spring and rises are skipped
and the composed mark fades in over ~400ms. The wipe itself is a
background-toned veil translating off the mark (transform + opacity only, UI
thread), so the approved SVG geometry is revealed, never distorted.

---

## 9. Components

Shared concepts. Implementations differ per platform; the APIs do not have to
match, because platform-native UX wins over symmetry.

`Button` · `Input` · `SearchInput` · `Card` · `Badge` · `Avatar` · `Dialog` ·
`BottomSheet` · `Tabs` · `SegmentedControl` · `Dropdown` · `Toast` · `Alert` ·
`EmptyState` · `LoadingState` · `ErrorState` · `ProductCard`

### What exists on native

`packages/ui-native` is the mobile implementation. One export subpath per module,
matching the existing `./screen` and `./providers` convention.

| Area | Modules |
| --- | --- |
| Primitives | `text` `button` `card` `badge` `chip` `avatar` `media` `fields` |
| Composition | `product-card` `product-grid` `calendar` `tab-bar` `display` `status` |
| Overlays | `bottom-sheet` `toast` |
| Brand | `brand-mark` |
| Motion | `motion` `tone` `icon` `icon-glyphs` `control-tokens` |
| Hero transition | `hero-provider` `hero-layer` |
| Layout | `screen` `providers` `app-list` |

`ProductGrid` wraps `AppList` (FlashList), not `ScrollView`. The catalogue is expected to
grow past fifty pieces, and a grid that renders every cell up front is how a
marketplace app starts dropping frames.

### Tones

`tone.ts` is the only place a semantic colour name is spelled out. Every tone
exposes two things: the Tailwind utility (so the element gets styled and Uniwind
bundles the variable) and the raw CSS variable (so SVG, which cannot take a
`className`, resolves the same colour at runtime). Reach for it rather than
repeating `text-muted-foreground` in twenty components.

### Buttons

Pill-shaped, 44px default, animated on colour only. Variants: `default`
(primary), `soft` (soft rose), `secondary`, `outline`, `ghost`, `destructive`,
`link`. `loading` shows a spinner, sets `aria-busy` and blocks interaction while
keeping the label mounted so the button does not resize mid-request.

```tsx
// ✅ tokens only
<Button variant="soft" size="lg" loading>Saving</Button>

// ❌ brand values inline
<Button className="rounded-[27px] bg-[#E86A93]" />
```

**Do** keep a control label to one line. `Button` is `w-full`, and a button
nested in a card inside a page carries padding at all three levels — roughly 96px
of a 390px phone is gone before a single letter is drawn. Long enough and the
label wraps, which reads as a mistake even though the lines are now centred.

```tsx
<Button>Keep browsing</Button>   // ✅ one line at any font scale
<Button>Keep browsing instead</Button> // ⚠️ wraps on a narrow phone
```

The app should say the same thing the same way in two places: `Keep browsing`
appears on both the List and the rental confirmation screen, because one action
should not have two names.

### Badges and chips

Two small pills, deliberately not merged. A **badge** states something about the
world — a condition, a status, a size — and is not interactive. A **chip** is a
choice: a filter, a category, an answer.

The brand rose is the single "this is the one you picked or the one that matters"
signal, and it is the *same* rose a primary button is filled with:

| State | Surface | Text | Icon |
| --- | --- | --- | --- |
| `Chip` selected | `bg-primary` (`active:bg-primary/85`) | `primary-foreground` | `primary-foreground` |
| `Chip` default | `border-border bg-card` (`active:bg-muted`) | `foreground` | `foreground` |
| `Badge variant="primary"` | `bg-primary` | `primary-foreground` | — |

```tsx
// ✅ the primary rose comes from the shared pair, never a literal
<Button variant="primary" />   // bg-primary
<Chip selected>Women</Chip>    // bg-primary — identical to the button above
<Badge variant="primary" />    // bg-primary

// ❌ hardcoded brand hex
<Chip selected className="bg-[#E86A93]" />
```

Three things follow from that table.

**Do** tint a chip's icon with the state tone. An untinted icon sits on
`bg-primary` at its own contrast and loses the pairing.

**Don't** use `bg-accent` for a selected chip or a primary badge. `--wearly-accent`
is the soft `#FCE7EF` wash — it reads as *disabled*. Reach for it when you want a
quiet rose surface, not a chosen one.

**Don't** put a mid status tone behind text. That rule at §3 still holds: status
badges stay `bg-*-background text-*-foreground`. `primary` is the one exception,
because it is deepened for white text in both themes.

The selected chip is never carried by colour alone — `accessibilityState.selected`
is set, so a screen reader announces the choice.

### Product cards

Imagery dominates: a 4:5 media block, `rounded-media`. The favourite button is a
44px circular control sitting in the media block's **padding**, not floating over
the photograph — it must never cover the garment.

Metadata is capped at three facts, led by name and price:

```
Brand
Satin slip dress
₹299 /day          Size S
★ 4.8 (12)         Indiranagar
```

Upload timestamps and similar low-value facts are omitted rather than shrunk: a
card that shows everything communicates nothing.

The favourite heart uses `text-primary`, not `brand` — it is `aria-pressed`, so
it is a control with text-equivalent state, not decoration.

### Tables

Rounded container, hairline row separators, `h-14` rows, pill status badges.
Heavy borders and dense rows are what make a dashboard feel like a spreadsheet.

### Dialogs

28px radius, generous padding, `max-w-lg`. A scrim soft enough that the dialog
stays the focus. On mobile, prefer a bottom sheet at 32px.

---

## 10. Mobile rules

- **Flexbox only. Never absolute positioning.** It breaks across screen sizes,
  densities, notches and platforms.
- Minimum 44px touch targets (`h-control`); `h-touch` (52px) for primary actions.
- No hover. Pressed states carry the feedback that hover does on the web.
- Mobile must not be a copy of the desktop layout. Share colour, type, radius,
  spacing and iconography — not structure.
- **The app launches light.** `apps/mobile/src/core/theme/use-theme-override.ts`
  sets the initial preference to `light`, not to the OS scheme, so the palette
  being reviewed does not change with whichever phone is on the desk. Light is the
  reference render — the soft rose and warm off-white the colour system is tuned
  around. `EXPO_PUBLIC_WEARLY_THEME` still forces a theme for a specific run.
- **No in-app theme switch.** Dark is reviewed with a forced run
  (`EXPO_PUBLIC_WEARLY_THEME=dark`); the launch default stays light (see
  above). The dev-only floating toggle was removed 2026-10-05.
- Mobile app frames sit above the system status bar, so `Screen` insets with
  `edges={["top", "left", "right"]}` rather than padding by a guessed number.
- **The top inset is applied in two places, and nowhere else.** Screens that use
  `Screen` get it for free. Everything else gets `pt-safe` on its root — the tab
  screens through the wrapper in `apps/mobile/src/app/(tabs)/_layout.tsx`, and the
  product and rental screens on their own `flex-1` root. `pt-safe` is the *raw*
  inset, so a screen's own `pt-4`/`pt-6` becomes the gap between the status bar
  and its header instead of doing double duty as the inset. A screen must never
  combine `pt-safe` with its own hard-coded top padding: that is how a header ends
  up jammed against the notch on one device and marooned on another.

### Absolute positioning: overlays only

Absolute positioning is for surfaces that float **above** the app and do not
participate in layout. It is never a way to arrange things inside a screen — a
flexbox row or column is the answer there, always.

The sanctioned list, and each earns its place for a different reason:

| Surface | Why it cannot be laid out |
|---|---|
| `hero-layer.tsx` | Interpolates a card's measured rectangle to full-bleed. A transient animation layer; there is no flexbox way to interpolate between two positions. |
| `wearly-logo-animation.tsx` veil + flourish | Two transient splash layers: a background-toned veil that slides off the mark (the fabric wipe, transform-only so geometry is revealed never distorted) and the flourish SVG pinned over the base SVG at the identical size. Both are `pointer-events-none`, both unmount or park off-screen once the ~1.8s performance ends. |
| `product/[id].tsx` sticky bar | Sits on top of a scrolling list, so content passes beneath it. |
| `toast.tsx` | Overlays the navigator, above every route, without any screen knowing. |
| `ProductCard`'s favourite heart | Anchored to the image it belongs to, not to the card's flow. |
| `tab-bar-active-circle.tsx` | Floats above the bar's top edge, anchored to its sibling's measured slot centre. There is no flexbox way to place a surface outside its parent's bounds, which is the entire point of it. |
| `use-tab-item-motion.ts` wrappers | Scale a tab's contents inside its own slot. Contained, and needed so activation reads as more than a recolour. |
| `theme-toggle.tsx` | Dev-only, and above every screen by definition. |
| `onboarding-hero.tsx` Fashion pill | Floats absolute inside its own Row 2 relative unit (measured `onLayout` reserve + 2px gap) so the headline keeps a 2px gap with 1px row rhythm; text reserves the space so Rows 1/3 stay readable. Contained overlay, not layout. |

`bottom-sheet.tsx`'s scrim is a fifth: `absolute inset-0` over the modal.

Anything that is not in this table is not an overlay, and a second absolute
surface in a screen layout is a design decision that has to earn its place rather
than a default.

### Motion on native

`motion.css` holds durations for CSS transitions; `motion.native.ts` holds the
same numbers for Reanimated, which cannot read a CSS custom property. They must
change in the same commit. Springs (`press`, `pop`, `hero`, `tab`) live only in
the native file, because CSS has no equivalent.

### Press feedback is `1.0 → 0.97 → 1.0` via `usePressScale`, and the favourite
heart pops via `useHeartPop`. Both are the documented exceptions to "buttons
animate colour only" — they are contained inside their own control's bounds and
cannot shift surrounding layout.

### The tab bar's active state is one travelling circle, and it carries the icon

`TabBarActiveCircle` is the third sanctioned transform. It translates to the
active tab's **measured** slot centre, so it moves to where the tab actually is
rather than to where a `width / 4` calculation guesses it is.

There is exactly **one** of them. A per-tab background that fades in and out
would draw the same information and lose the thing that makes a good bottom bar
feel good: the sense that you never left the control, only moved within it. One
object crossing the bar says that. Four independently-lit backgrounds say the old
tab died and a new tab was born.

**The circle carries the active glyph, and that is the load-bearing decision.**
The filled icon is drawn *inside* the circle, so the disc and its glyph are one
object crossing the bar. The alternative — leaving the glyph in the tab and having
it chase a circle that travels separately — needs two animations locked together
across two axes, and any drift between them reads as the exact bug the single
indicator exists to prevent.

It follows that an inactive tab renders its own outline icon, and the active tab
renders an `opacity-0` placeholder of the same size. The space is held rather than
collapsed so the row's height is identical in both states and the bar cannot
change height mid-travel.

### The swipe-to-continue track is a `PanResponder` control, not a gesture

`SwipeToContinue` (welcome step 1) is a hand-built drag on `PanResponder` and
the classic `Animated` API. Travel is the visible track's own reported width
less a fixed thumb — no assumed numbers, no clipping mask, no UI thread. That
constraint is the whole design, and it was earned three times over: a
worklet-driven `Pan` froze on a travel value stuck at 0, an explicit-arithmetic
pass overshot on a gutter assumption the device did not share, and a clipping
mask hid the overshoot instead of fixing the stop. The track reporting itself
removes all three failure modes at once.

The rules that make it a control rather than a decoration:

- **Travel comes from the track itself.** The visible track reports its own
  width via `onLayout` and travel is that less the fixed `THUMB_WIDTH` — so the
  thumb stops flush at the inner edge on any screen, with no clipping mask to
  hide behind. Until the first layout lands, an explicit fallback (screen less
  both page gutters) keeps the control usable on frame one. The one coupling: a
  longer label needs a wider thumb in the same edit.
- **Nothing runs on the UI thread.** No Reanimated, no gesture-handler, so the
  swipe cannot regress with their major versions.
- **The thumb stops flush, unclipped.** Travel ends exactly at the inner edge,
  and the track carries no `overflow-hidden` — clipping would hide an overshoot
  instead of preventing it. A thumb that grows while dragged would bulge past
  the edges by definition, so grab feedback is haptic-only and the thumb never
  scales.
- **A partial drag springs back.** Below 60% the thumb returns to 0. A failed
  swipe has to be visible — otherwise a user who does not quite reach the end is
  left with a control that silently did nothing.
- **Haptics mark the two moments that matter**: a light tick on grab (without
  it the first pixels of drag read as dead travel) and a medium impact on
  completion, fired fire-and-forget so neither delays the navigation.
- **A vertical drag is not claimed.** The responder only takes horizontal
  intent, so reusing this inside a scrolling parent stays safe.
- **The thumb stops flush, unclipped.** Travel ends exactly at the inner edge,
  and the track carries no `overflow-hidden` — clipping would hide an overshoot
  instead of preventing it. A thumb that grows while dragged would bulge past
  the edges by definition, so grab feedback is haptic-only and the thumb never
  scales.

**Accessibility, stated honestly.** This control is swipe-only by decision, so
there is no `onPress` fallback. That is a real cost: a screen-reader or
switch-control user reaches a `role="button"` element with no way to activate it,
and a user who does not discover the drag has no visible "Next" anywhere on the
screen. It is accepted because this is step 1 of 3 and the remaining steps are
tap-driven, but it is **not** a pattern to extend. Any future gate must ship a
tap path in the same commit, and the role/label/hint are the minimum, not a
substitute for one.

### A circle is `rounded-pill` on a square box, and here that is correct

An earlier version of the bar used a *rounded rectangle* capsule, and three passes
moved its size around while it kept rendering as a circular selected button. The
width was never the problem. **The radius was.**

| Radius | Capsule | Straight vertical edge | Reads as |
|---|---|---|---|
| `rounded-pill` (9999px) | any | **none** — always half the height | stadium, so a near-square stadium is a circle |
| `rounded-lg` (20px) | 50×56 | `56 − 2×20` = 16px, but on the 44px version `44 − 2×20` = **4px** | squircle |
| `rounded-sm` (12px) | 58×48 | **24px**, and ~34px horizontally | rounded rectangle ✓ |

`rounded-pill` is the wrong tool for a rounded *rectangle*: it is exactly half the
height on any box, so it forces a shape with no straight edges, and no amount of
width makes that read as one. `rounded-lg` was a half-measure — 91% of
half-height leaves 4px, which is not visible.

**The diagnostic still holds, and it is the thing to check first next time
something renders as a blob:** a rounded rectangle needs visible straight edges or
it *is* a circle. What changed is the intent. The old bar wanted a rectangle and
kept getting a circle; this one wants the circle, so `rounded-pill` on a square box
is now the correct answer rather than the first thing to reach for and debug away.
The table above documents a trap, not a rule to keep applying.

Dropping the capsule also dissolves the arithmetic that constrained it. The circle
is square and fixed at `CIRCLE` (48pt), so it no longer fights its own width — the
bar went from five slots to **four**, which on a 360pt phone puts ~78pt behind
each tab rather than ~58pt. Nothing about the circle's aspect ratio is negotiated
against the content around it, because it contains none of the content.

**Position is measured, never computed** — see `useTabFrames`, which is where the
numbers come from. `CIRCLE_OVERHANG` is applied as a static `translateY` rather
than animated, so the circle cannot drift vertically against a spring that is
running on the horizontal.

**The circle springs; the contents do not.** It runs on `SPRING.tab`, damped
close to critical. The argument is not "springs are better" — it is that the
circle is an *object* with a centre of mass the eye can follow, where the old
capsule was a shape that was merely being resized across a bar. The
`SPRING.tabIndicator` that preceded it was removed for reading as wobble on a 50px
capsule, and that reasoning does not transfer: a 48pt disc reads as a disc
travelling, not as a shape wobbling. It is tighter than `hero` on purpose, since
the bar is re-tapped constantly and anything slower reads as lag.

`useTabItemMotion` is now only the label. It fades from 85% to full and scales
`1 → 1.02`, from one shared `progress` value so there is a single clock rather than
two animations that drift apart. It does not drive the icon at all — the circle
owns that.

**Nothing inside a tab moves vertically, and the circle moves for all of them.**
An earlier version lifted the icon 2px and the label 1.5px as they became active,
to make them "settle into the pill". In practice it made the active tab the only
tab in the bar whose icon and label were not centred in its own slot — a permanent
half-pixel of misalignment on precisely the tab being looked at. The active state
reads from the circle, the glyph swap, the tone and the label's weight
(`font-medium` active, `font-normal` inactive). The press scale comes from
`usePressScale` and is applied to the pressable.

The bar's own geometry is named constants in `tab-bar.tsx`: `SLOT` (`h-14`) on
the tab, `CIRCLE`, `CIRCLE_OVERHANG`, and the container's `pb-safe-or-4`.

### Four destinations, and `rentals` is no longer one of them

The bar is **Home, Discover, List, Profile**. Rentals left the bar; its screen is
still registered in `apps/mobile/src/app/(tabs)/_layout.tsx` and stays
deep-linkable, but it has no in-bar entry point and must be reached from Home or a
product card. A wardrobe list is a place you visit deliberately, not one of the
four things you bounce between all day, and dropping it is what buys the circle
the slot width it needs.

`ROUTES.TABS` in `apps/mobile/src/core/routing/routes.ts` still lists five. It is
exported but unused by the bar, so it is stale rather than wrong — but it is a
trap for the next person who reaches for it, and should be reconciled or deleted.

### The bar's bottom padding is `max(inset, 1rem)`

`pb-safe-or-4` expands to `max(env(safe-area-inset-bottom), 1rem)`. This is the
form the bar needs, and the reason is that neither half of it is sufficient on its
own: the raw inset alone leaves the bar flush to the screen edge on any device
that reports no inset, and a fixed padding over-pads a device with a home
indicator. Taking the larger of the two covers gesture nav, three-button nav and
iPhones with no per-platform constant anywhere. The bar's top inset is the plain
`pt-2`; it is a *gap*, not a safe-area inset.

### Never use `entering=` for content that has to be readable

`entering={FadeIn}` starts at `opacity: 0` and depends on a layout animation
running. If it does not — a reduced-motion path, a worklet that has not attached,
a fast refresh mid-transition — the content stays at zero and the screen is
blank. That failure is invisible in review and obvious to a user.

Use `useFadeIn()` from `@wearly/ui-native/motion` instead. It animates shared
values from an effect, so under reduced motion both start at their final value
and the end state is always reachable.

### `Screen` content must `grow`

`Screen` defaults its content wrapper to `flex grow flex-col`. Without `grow` the
wrapper sizes to its content, and a `flex-1` child inside it has no height to
centre against — which renders as everything jammed into the top-left corner.
Any custom `contentClassName` has to keep `grow` unless it deliberately owns the
height.

## 11. Admin rules

Admin is the same brand, not a separate product — and specifically *not* a
harsh full-height dark sidebar.

- Sidebar on `background`, not a dark slab. Active item gets the soft rose
  `accent` fill with a `primary` icon, at `rounded-sm`–`rounded-md`.
- Stat cards at `rounded-card` with generous whitespace.
- Tables per the rules above.
- Charts echo the palette: rose for the primary series, status colours
  sparingly, everything else neutral.

---

## 12. Accessibility

Accessibility is a hard requirement, not a pass at the end.

- **Contrast.** Every text/background pair in `colors.css` was solved to meet
  WCAG AA (4.5:1 text, 3:1 non-text) in **both** themes. The two deviations from
  the original brief above exist for exactly this reason. Re-check contrast
  before adding a new colour pair.
- **Focus.** Every interactive element has a visible `focus-visible` ring
  (`ring-4 ring-ring/25`). Never `outline: none` without a replacement.
- **Targets.** 44px minimum on mobile; icon buttons are `size-11`.
- **Semantics.** Real `<button>`, `<a>`, `<label>`, table markup. Icon-only
  controls carry `aria-label`; decorative icons are `aria-hidden`.
- **State.** `aria-busy` while loading, `aria-pressed` on toggles,
  `role="status"` and `role="alert"` on loading and error regions. Errors always
  offer a retry when the failure is likely transient.
- **Motion.** Respect `prefers-reduced-motion`.
- **Images.** Always `alt`. Decorative imagery takes an empty `alt`.

---

## 13. Do / don't

**Do** reach for a token.

```tsx
<div className="rounded-card bg-card p-6 text-foreground" />
```

**Don't** hardcode brand values.

```tsx
<div className="rounded-[27px] bg-[#E86A93] text-[#272126]" />
```

**Do** use the component radius names.

```tsx
<Button variant="soft" />   {/* rounded-button */}
```

**Don't** pick a numeric step for a component.

```tsx
<Button className="rounded-2xl" />   {/* drifts from --wearly-radius-button */}
```

**Do** add a missing value to `design-tokens`.

```css
--wearly-surface-raised: oklch(…);
```

**Don't** add a one-off hex "just this once". That is how a design system rots.

**Do** keep both theme blocks symmetric.

```css
@variant light { --wearly-x: …; }
@variant dark  { --wearly-x: …; }
```

**Don't** add `--wearly-y` to light only. Uniwind errors on mismatched themes.

**Do** use a `*-foreground` status token for text.

```tsx
<Badge variant="success" />   {/* bg-success-background + text-success-foreground */}
```

**Don't** put white text on `bg-success` — 2.75:1 on white.

`bg-primary` is the deliberate exception to the rule above. It is deepened to
`#C54B75` in **both** themes precisely so white text clears AA on it, which is
what lets a selected chip and a primary badge share the primary button's fill.

---

## 14. Changing the system

A developer should be able to change the product's look from one file.

| Goal | Edit | Propagates to |
| --- | --- | --- |
| Brand colour | `--wearly-primary` in `colors.css` | Buttons, links, rings, active nav, tabs, selected chips, primary badges, HeroUI both platforms |
| Decorative pink | `--wearly-brand` | Hearts, indicators |
| Text on decorative pink | `--wearly-brand-foreground` | Filled `brand` cards |
| Global roundness | `--wearly-radius-*` | Every button, input, card, dialog, sheet |
| Type | `--wearly-font-sans` | Both platforms |
| Elevation | `--wearly-shadow-*` | Cards, overlays |
| Speed | `--wearly-duration-*` | All transitions |

`/design-system` on the web renders every token live in both themes — use it to
verify a change before shipping it.

---

## 15. Font licence

Satoshi is by [Indian Type Foundry](https://www.indiantypefoundry.com/),
distributed via [Fontshare](https://fontshare.com/fonts/satoshi) under the **ITF
Free Font License v2.0** — not an SIL Open Font License.

- Self-hosting and embedding in web and mobile applications are **explicitly
  permitted**.
- Use is free for commercial purposes with no attribution.
- **Redistributing the font files themselves is prohibited** — do not publish
  them in a public package or as a standalone download.

If legal ever objects to self-hosting, font delivery is isolated to
`apps/web/src/app/fonts.css` and `apps/mobile/src/lib/fonts.ts`. Swapping both to
Fontshare's hosted CSS leaves every token and component untouched.

---

## 16. Adding components

**Web** — shadcn, into `packages/ui`:

```bash
cd apps/web && bunx shadcn@latest add <component>
```

Components are written to `packages/ui/src/components/ui`. Restyle them onto the
tokens after adding; the generated markup is plain shadcn, not Wearly.

**Mobile** — hand-written, in `packages/ui-native/src`, on the token layer.

`heroui-native` stays a devDependency and `heroui-native.css` stays imported, but
its components are **not** used at runtime. Its barrel re-exports `BottomSheet`,
`Popover`, `Select` and `GlassView`, all of which import `@gorhom/bottom-sheet`
and `expo-blur` as peer dependencies this workspace does not install — so
importing the provider at all fails to resolve. The components Wearly needs are
built on the token layer instead, which also means full control over the radius
and border treatment rather than restyling generated markup afterwards.

If HeroUI Native is adopted later, the peers have to be installed *first* and the
`heroui-native.css` bridge already in place will pick the palette up.

**Both** — if a token is missing, add it to `packages/design-tokens` first.
Never introduce a second styling system, and never add a component library.

---

## 17. Change log

| Date | Change |
| --- | --- |
| 2026-10-07 | Product sticky CTA is one full-width button — `Rent this · ₹total` (`dailyRate × days`) with a smaller `/N days` suffix nested in the label (`caption`, `primary-foreground`). The side price block and deposit note are gone; the footer is just the bar + button. |
| 2026-10-07 | Product header chrome (status backdrop, bar background, hairline) shares one animated opacity (`DURATION.base`, instant under reduced motion) instead of instant class swaps: the header is a column shell with a fading `bg-card` layer, content row, and 1px hairline. Title steps down `headingMd` → `headingSm`. |
| 2026-10-07 | Product header title fades in/out (`opacity`, `DURATION.base` 200ms on the UI thread, instant under reduced motion) instead of popping: always mounted, `aria-hidden` while transparent. |
| 2026-10-07 | Product header title is dynamic: empty at rest, shows the piece name (truncated) once the in-content title scrolls fully past the header, clears when scrolled back. Crossing measured with page coords (`measure` on title + header, threshold in a shared value) so it survives insets and type sizes. |
| 2026-10-07 | Product header gains symmetric `pb-4` (`pt-4` + `pb-4` around the `size-12` buttons) so the hairline never touches the icons; the photo pull-up moves `-mt-16` → `-mt-20` to match the new 80px header height. |
| 2026-10-07 | Product header back button uses the `outline` variant (`bg-card` + `border-border`, same `size-12` as the heart): white with a border instead of transparent ghost, so it reads over the photo. No new tokens. |
| 2026-10-07 | Product status strip gets its own opaque backdrop (`pt-safe` View, `bg-background` at rest → `bg-card` once scrolled): the parallax photo drifts up underneath it instead of showing through the status bar. Same `z-10` as the header so paint order holds. |
| 2026-10-07 | Product header gains a solid `bg-card` background with a hairline once scrolled (`y > 8`, clears at rest): transparent while floating over the hero, solid once content slides underneath. Border slot always rendered (`border-transparent` at rest) so pinning never re-lays-out. |
| 2026-10-07 | Product hero parallax: the fixed photo drifts up at half the scroll speed (`useHeroParallax`, Reanimated UI thread, honours reduced motion) while the sheet slides over it. Sticky-header attempt reverted — header is a fixed sibling above the scroller again. |
| 2026-10-07 | Product detail header is sticky (`stickyHeaderIndices`, same as Home search): the 3:4 photo scrolls in-flow and slides up with the sheet, and the header stays pinned above the scrolling content. Fixed-photo overlay removed. |
| 2026-10-07 | Product detail hero is fixed: the scroll layer overlaps the photo (transparent spacer) so the sheet slides up over it on scroll and uncovers it on scroll back. Header stays fixed above the scroller. No absolute positioning — flex siblings plus a measured negative margin. |
| 2026-10-07 | Product sheet `shadow-lift` deepened (`0 12px 36px -8px` @ 14% → `0 16px 48px -8px` @ 18%) so the 56px top radius reads against light photography. |
| 2026-10-07 | Product detail sheet flows flush into the sticky CTA: debug `border-red-500` removed, scroll `pb-8` moved inside the sheet (`pt-8 pb-8`) so no blank strip sits between the sheet and the bar's hairline. |
| 2026-10-07 | Product detail sticky CTA is a static flex footer (same as rent flow), not an absolute overlay — the `pb-44` scroll clearance is removed so no white strip sits above `Rent this`. |
| 2026-10-07 | Product detail content sheet: new `--wearly-radius-6xl` (56px, `rounded-t-6xl`) and new `shadow-lift` (`--wearly-shadow-xl`, one step above `float`) so the white curve lifts off the hero photograph. Both declared in `design-tokens` and symmetric across themes; no one-off values. |
| 2026-10-07 | Product detail scroll content painted `bg-card` so the `pb-44` CTA clearance no longer shows a page-background strip between the white sheet and the white sticky bar — only the bar's hairline separates them. |
| 2026-10-07 | Product detail Reviews card bottom padding `p-5` → `pb-3`: its inner padding stacked with the sheet `gap-10` (~60px) versus ~48px at other junctions. |
| 2026-10-05 | Home header + content cards bumped to a new `--wearly-radius-5xl` (48px) token (`rounded-b-5xl` / `rounded-t-5xl`); search strip top padding reduced to a constant `pt-4`. |
| 2026-10-05 | Home header greeting tightened (`gap-0.5`, `price` 17px medium, one line); docked search strip slims its top padding via scroll-measured header height (static class literals only). |
| 2026-10-05 | Removed the dev-only floating theme toggle (`theme-toggle.tsx` deleted, root layout unmounted — dark is reviewed via `EXPO_PUBLIC_WEARLY_THEME=dark`); home header row is avatar-first with a larger avatar and a one-line greeting. |
| 2026-10-05 | Home cards moved to a new `--wearly-radius-4xl` (40px) token; sheet top border removed (it traced outside the rounded corners); `HomeSearch` placeholder truncates via `flex-1` + `numberOfLines` so it never spills past the pill. |
| 2026-10-05 | Home is two full-bleed white cards separated by a `bg-muted` gap: header card (greeting + search) rounded bottom-only, content sheet rounded top-only, both at the 32px sheet radius; search strip bottom padding (`pb-5`) matches the sheet's top inner padding. Greeting scrolls away while search stays pinned via `ScrollView stickyHeaderIndices`; recommended grid rendered as flex `flex-row` pairs (6 items need no virtualisation) so the screen keeps one vertical scroller. Tokens only, tab bar untouched. |
| 2026-10-05 | Mobile screen gutters unified to reusable `px-gutter`/`mx-gutter` (16px): `Screen` `p-4` → `p-gutter`, `welcome` `px-4` → `px-gutter`, all tab/rent/product/grid/sheet/toast `px/mx-page-inline` → `px/mx-gutter`. Web `px-page-inline` unchanged. |
| 2026-10-05 | Home is a single screen again: v3 moved to the tab root `/(tabs)`, v1/v2 screens + `editorial-masthead`/`lead-story`/`occasion-rail` + `homeLegacy`/`homeV2`/`homeV3` route keys deleted, `TABS` fixed to the real 4 tabs. |
| 2026-10-04 | `Media` accepts bundled `require()` + `fallbackSrc` (remote on `onError`, tone block last); onboarding hero uses local `onboarding-hero.png` with the Unsplash hoodie as fallback. |
| 2026-10-04 | Onboarding hero: Fashion pill `accent` → `primary` fill with `primary-foreground` (white) text; pager active dot `accent` → `primary`. |
| 2026-10-04 | `buttonXl` control token (20px) added; `SwipeToContinue` thumb label `buttonLg` → `buttonXl`, inner `px-3` → `px-2`. |
| 2026-10-04 | `buttonLg` native token (`text-native-button-lg`, 16px) added; `SwipeToContinue` thumb label `label` → `buttonLg`, inner `px-5` → `px-3`. |
| 2026-10-04 | Headline `displaySm` (32px) token added (`typography` + `theme` + `Text` variant); onboarding hero headline + Fashion pill moved `display` → `displaySm`. |
| 2026-10-04 | Onboarding hero headline: 3 forced centered lines (`Get Ready For` / pill + `With Your` / `Own Style`), Fashion pill absolute with measured reserve + 2px gap, row gap `gap-px` + `leading-tight` (1px line-height requested but impossible — 36px glyphs clip; 1.15 is the minimum). Recorded as §10 sanctioned overlay. |
| 2026-10-04 | Welcome frame narrowed to `px-4 pt-4 pb-6` (16/16/24) to match Home/`Screen p-4`; `PAGE_GUTTER` 48→32 so the swipe fallback arithmetic agrees. `px-page-inline` (24px) is web-only. |
| 2026-10-04 | `SwipeToContinue`, seventh pass — exact end-stop, no clipping. Removed `overflow-hidden` (it hid overshoot instead of preventing it) and the grab scale (a growing thumb bulges past the edges by definition). The visible track now reports its own width via `onLayout` and travel is that less the fixed thumb, with the explicit screen-minus-gutters arithmetic kept as the pre-first-layout fallback. Rule: measure the node the user sees, stop flush, never mask. |
| 2026-10-04 | `SwipeToContinue`, fifth pass — rebuilt the screenshot structure (wide pill thumb with the label inside, static `>>` chevrons) on `PanResponder` + classic `Animated` with fully explicit geometry, and removed `react-native-expo-swipe-button` + `expo-linear-gradient`. The library spike proved the technique drags smoothly where the worklet version stood still. (Superseded in part by the sixth and seventh passes: the grab scale bulged past the edges and was removed, and explicit arithmetic overshot on a gutter assumption — see above.) |
| 2026-10-04 | `SwipeToContinue`, third pass — root-caused the frozen thumb. The drag math, gesture and animation pipeline were all proven working (grab-scale rendered, far-right release completed); the tap test (a tap with no drag advanced) proved `travel` was stuck at 0. Cause: the track was measured on the bare gesture host `Animated.View` instead of the visible track. Verified in the Reanimated 4.5 sources that the classic `createAnimatedComponent` path sets no `collapsable={false}` default, so a style-less animated node is eligible for view flattening — no native node, no real layout, `travel = max(0, 0 − thumb − 8) = 0` forever, and `0 >= 0` completed on any release. `onTrackLayout` now sits on the styled track `View` (which Uniwind forwards untouched and which can never flatten), the thumb height class is a static literal (Uniwind scans source statically; an interpolated class risks being missed), and `onEnd` refuses to complete when `travel <= 0` — a gate that completes without a drag is worse than one that visibly refuses. Rule: measure the node the user sees, never its wrapper. |
| 2026-10-04 | Onboarding step 1 redesigned: full-bleed hero, a display headline with one word on a rotated accent pill, a three-dot pager, and `SwipeToContinue` in place of the Next button. Steps 2 and 3 keep their tap buttons — a drag gate on a screen that is *asking a question* is hostile. Recorded the swipe track as the fourth sanctioned transform in §10, with the three rules that make it a control (measured travel, spring-back on a partial drag, threshold completion that fires once) and an explicit note on what swipe-only costs a screen-reader user. |
| 2026-09-30 | Tab bar, fourth pass — **the active background was still a circle, and the radius was the reason.** Three prior passes had moved the *size* of the capsule around; the width was never the fault. `rounded-pill` (9999px) is exactly half the height on any box, so it forces a shape with no straight edges — and no amount of width makes a near-square stadium read as a rectangle. The half-measure `rounded-lg` (20px) was no better: on a 44pt capsule it left a 4pt straight vertical edge, a radius at 91% of half-height, i.e. a squircle. Now `rounded-sm` (12px) on a 48pt capsule, which leaves a 24pt straight vertical edge and ~34pt horizontally. **A rounded rectangle needs visible straight edges or it is a circle — check the radius first, before touching size.** To make the capsule *landscape* the content had to shrink: `--leading-normal` is 1.5, so a 12pt caption sat in an 18pt line box with 3pt of dead space above and below every label; `leading-tight` (1.15 → 14pt) takes the content column from ~45pt to ~40pt, which is what buys the aspect ratio. Icon `sm` (18) → `md` (22), gap 6pt → 4pt. Final capsule ~58×48 inside a ~66pt slot. Recorded in §10 that 48pt is the ceiling: a capsule that is both 64pt tall and `100% - 16pt` of the slot would be 50×64 — *more* portrait — and a 2:1 capsule around stacked content needs ~90pt of width that a 66pt slot does not have. The capsule's width is the slot's width less `PILL_INSET` (4pt) and is structurally incapable of depending on a label: no intrinsic sizing, no per-label measurement pass. Third pass had used `inset-y-1.5`, which **silently failed to resolve under Uniwind** — no warning, no error, the capsule reverted to stretching the full slot while the source read as fixed; `useTabFrames` now reports `slotHeight` and the box is arithmetic on measured values. |
| 2026-09-30 | Tab bar, third pass: content-sized the width `+20px` and replaced `rounded-pill` with `rounded-lg`; removed the 2px icon / 1.5px label lift, which made the active tab the only tab not optically centred in its slot; moved press scale to the pressable via `usePressScale`; indicator and tab contents now share `DURATION.base`/`EASE_OUT` (200ms, ease-out) instead of two springs, deleting `SPRING.tab` and `SPRING.tabIndicator`; slot became a fixed `h-14`; container gutter `px-4`→`px-3`. **Fixed a real safe-area bug**: `tab-bar.tsx` carried a comment claiming the navigator already applied `insets.bottom`, and no such code existed — the wrapping `View` in `/(tabs)/_layout.tsx` only has `pt-safe`, so on a device with a home indicator the bar sat flush to the screen edge on a fixed `pb-3`. Now `pb-safe-or-4` = `max(inset, 1rem)`. **(Superseded: the size changes above did not fix the circle; the fourth pass identified the radius.)** |
| 2026-09-30 | Tab bar, second pass: sized the pill from each tab's **content** rather than its slot. With five equal `flex-1` slots every frame measured the same, so the pill was a fixed-width bar and the horizontal resize the design is built around never happened; it now hugs "Discover" and "Home" differently, clamped to its own slot. Rebuilt the resize as a `scaleX` spring over an instantly-set layout `width`, because animating `width` re-measures the view every frame and was the actual source of the drag. Extracted `use-tab-frames.ts` once the second measurement pass pushed `tab-bar.tsx` over budget. Separately, fixed a Uniwind warning in `fields.tsx`: `selectionColorClassName`/`placeholderTextColorClassName` need `accent-*` utilities, not `text-*` — the text form resolved to nothing, warned, and silently left the cursor colour at the platform default. **(Superseded by the third pass above.)** |
| 2026-09-30 | Tab bar: removed the centre `+` action. It was a fixed 48px filled circle with no label, which made it a button wearing a nav item's clothes — and it meant the bar's geometry depended on one tab being a different shape from its neighbours. All five tabs are now equal `flex-1` slots, so "the listing screen" is `List`, the third destination, with a hanger glyph and its filled twin. Gave the pill a spring (`SPRING.tabIndicator`) instead of `DURATION.base`/`EASE_OUT`, added `useTabItemMotion` so the icon and label settle into the pill on one shared value, and relaxed the rule that forbade a spring here. |
| 2026-09-30 | Tab bar: added a sliding active indicator that travels to the active tab's measured `onLayout` frame, animating `translateX` and `width` on `DURATION.base`/`EASE_OUT` rather than a spring. Extracted `tab-bar-item.tsx` and `tab-bar-indicator.tsx` from a now-over-budget `tab-bar.tsx`, and gave the four destination tabs the press scale they were already calling `usePressScale` for but discarding. Recorded the indicator as the third sanctioned transform in §10. |
| 2026-09-30 | Mobile top safe-area: no screen outside `splash`/`welcome` applied the status-bar inset — nine of them guessed a fixed `pt-4`/`pt-6`/`pt-16`, so headers sat under the notch. Applied `pt-safe` in two places: the tab wrapper in `(tabs)/_layout.tsx` (covers all six tab screens) and the root of the product and three rental screens. Documented the split in §10 — the inset is `pt-safe`, and a screen's own `pt-*` is the gap below it. |
| 2026-09-30 | Mobile Home: added the story-first `/(tabs)/home-v2` variant (masthead, lead story, occasion rail, lender note, grid last) and moved `ProductCard`'s favourite heart inside the media block, bottom-right. Floated the tab bar as a shadowed pill inset from the screen edges, and added filled twins for the four tab glyphs so the active tab reads as filled rather than just recoloured. Made light the mobile launch theme instead of the OS scheme, and added a `__DEV__`-gated three-state theme toggle. Rewrote §10's absolute-positioning rule, which claimed a single exception while five sanctioned overlays already existed. |
| 2026-09-29 | Fixed the native `@source` path in `apps/mobile/src/global.css` (it pointed one level too high, so nothing in `packages/ui-native` was ever scanned and every shared component rendered unstyled). Made `Screen` content `grow`. Replaced all five `entering=` usages with `useFadeIn`. Replaced the three stock Expo brand assets with renders of the Wearly mark and deleted `assets/expo.icon`. Added a dev-only `EXPO_PUBLIC_WEARLY_THEME` override.
| 2026-09-29 | Mobile Phase 1: recorded the `ui-native` component inventory (§9), the hero-overlay exception and native motion tokens (§10), and the HeroUI Native situation (§16). Added `--wearly-height-sheet`, `--wearly-tracking-brand` and a `bg-backdrop` utility. Removed the orphaned `src/tokens.css`, which carried a conflicting violet palette and the `.dark {}` pattern §2 forbids. |
