/**
 * Reference values shown on the showcase page. Kept as data rather than inline
 * JSX so the same list can drive both the swatches and the documentation.
 */

export interface Swatch {
  /** Tailwind background utility, e.g. `bg-primary`. */
  className: string;
  /** Hex the token was derived from, for cross-checking against the brief. */
  hex: string;
  note?: string;
  /** Token name as written in `colors.css`. */
  token: string;
}

export const surfaces: Swatch[] = [
  { className: "bg-background", hex: "#FFFBFC", token: "--wearly-background" },
  { className: "bg-card", hex: "#FFFFFF", token: "--wearly-card" },
  { className: "bg-muted", hex: "#F8F2F5", token: "--wearly-muted" },
  { className: "bg-secondary", hex: "#F9EEF2", token: "--wearly-secondary" },
  { className: "bg-accent", hex: "#FCE7EF", token: "--wearly-accent" },
];

export const brand: Swatch[] = [
  {
    className: "bg-primary",
    hex: "#C54B75",
    note: "Accessible rose. Default for anything with text on it.",
    token: "--wearly-primary",
  },
  {
    className: "bg-brand",
    hex: "#E86A93",
    note: "Decorative only — rings, active indicators, hearts. No text.",
    token: "--wearly-brand",
  },
  { className: "bg-ring", hex: "#C54B75", token: "--wearly-ring" },
];

export const text: Swatch[] = [
  {
    className: "bg-foreground",
    hex: "#272126",
    token: "--wearly-foreground",
  },
  {
    className: "bg-muted-foreground",
    hex: "#7E7178",
    token: "--wearly-muted-foreground",
  },
  {
    className: "bg-secondary-foreground",
    hex: "#5E4851",
    token: "--wearly-secondary-foreground",
  },
  {
    className: "bg-accent-foreground",
    hex: "#7A304D",
    token: "--wearly-accent-foreground",
  },
];

export interface StatusSwatch {
  className: string;
  foregroundClassName: string;
  hex: string;
  label: string;
}

export const statuses: StatusSwatch[] = [
  {
    className: "bg-success-background",
    foregroundClassName: "text-success-foreground",
    hex: "#437B5E on #EDF7F1",
    label: "success",
  },
  {
    className: "bg-warning-background",
    foregroundClassName: "text-warning-foreground",
    hex: "#9C651A on #FFF5E8",
    label: "warning",
  },
  {
    className: "bg-destructive-background",
    foregroundClassName: "text-destructive-foreground",
    hex: "#B94656 on #FDECEF",
    label: "destructive",
  },
  {
    className: "bg-info-background",
    foregroundClassName: "text-info-foreground",
    hex: "#5071A0 on #EEF4FC",
    label: "info",
  },
];

export const radius = [
  { px: 8, token: "--wearly-radius-xs", utility: "rounded-xs" },
  { px: 12, token: "--wearly-radius-sm", utility: "rounded-sm" },
  { px: 16, token: "--wearly-radius-md", utility: "rounded-md" },
  { px: 20, token: "--wearly-radius-lg", utility: "rounded-lg" },
  { px: 24, token: "--wearly-radius-xl", utility: "rounded-xl" },
  { px: 28, token: "--wearly-radius-2xl", utility: "rounded-2xl" },
  { px: 32, token: "--wearly-radius-3xl", utility: "rounded-3xl" },
  { px: "9999px", token: "--wearly-radius-pill", utility: "rounded-pill" },
] as const;

export const componentRadius = [
  { px: "pill", use: "Buttons", utility: "rounded-button" },
  { px: "pill", use: "Badges, chips", utility: "rounded-badge" },
  { px: 16, use: "Inputs, selects", utility: "rounded-input" },
  { px: "pill", use: "Search fields", utility: "rounded-search" },
  { px: 24, use: "Cards", utility: "rounded-card" },
  { px: 20, use: "Product imagery", utility: "rounded-media" },
  { px: 28, use: "Dialogs", utility: "rounded-dialog" },
  { px: 32, use: "Bottom sheets", utility: "rounded-sheet" },
] as const;

export const typeScale = [
  { px: "36–44px", use: "Hero / marketing", utility: "text-display" },
  { px: "30–36px", use: "Page title", utility: "text-heading-xl" },
  { px: "24–30px", use: "Section title", utility: "text-heading-lg" },
  { px: "24px", use: "Subsection", utility: "text-heading-md" },
  { px: "20px", use: "Card title", utility: "text-heading-sm" },
  { px: "17px", use: "Lead paragraph", utility: "text-body-lg" },
  { px: "15px", use: "Default body", utility: "text-body-md" },
  { px: "14px", use: "Secondary text", utility: "text-body-sm" },
  { px: "13px", use: "Form labels, buttons", utility: "text-label" },
  { px: "12px", use: "Metadata, timestamps", utility: "text-caption" },
] as const;

export const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96] as const;

export const elevation = [
  { use: "Cards, resting surfaces", utility: "shadow-soft" },
  { use: "Hovered / draggable", utility: "shadow-raised" },
  { use: "Dialogs, sheets, sticky bars", utility: "shadow-float" },
] as const;
