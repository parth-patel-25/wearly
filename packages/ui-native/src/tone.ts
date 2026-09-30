/**
 * Tones — the one place a semantic colour name is spelled out.
 *
 * Every component that paints text, an icon or a border needs the same pair of
 * things: the Tailwind utility class (so the element actually gets styled, and
 * so Uniwind bundles the variable) and the raw CSS variable name (so SVG — which
 * cannot take a `className` — can resolve the same colour at runtime).
 *
 * Spelling these out in twenty components is how `text-[#C54B75]` happens.
 */

import { useCSSVariable } from "uniwind";

/** Semantic text/icon colour roles. */
export const TONE = {
  accent: {
    className: "text-accent-foreground",
    variable: "--wearly-accent-foreground",
  },
  "accent-foreground": {
    className: "text-accent-foreground",
    variable: "--wearly-accent-foreground",
  },
  brand: {
    className: "text-brand-foreground",
    variable: "--wearly-brand-foreground",
  },
  "brand-decorative": { className: "text-brand", variable: "--wearly-brand" },
  "card-foreground": {
    className: "text-card-foreground",
    variable: "--wearly-card-foreground",
  },
  destructive: {
    className: "text-destructive-foreground",
    variable: "--wearly-destructive-foreground",
  },
  "destructive-foreground": {
    className: "text-destructive-foreground",
    variable: "--wearly-destructive-foreground",
  },
  foreground: { className: "text-foreground", variable: "--wearly-foreground" },
  info: {
    className: "text-info-foreground",
    variable: "--wearly-info-foreground",
  },
  "info-foreground": {
    className: "text-info-foreground",
    variable: "--wearly-info-foreground",
  },
  "muted-foreground": {
    className: "text-muted-foreground",
    variable: "--wearly-muted-foreground",
  },
  "popover-foreground": {
    className: "text-popover-foreground",
    variable: "--wearly-popover-foreground",
  },
  primary: { className: "text-primary", variable: "--wearly-primary" },
  "primary-foreground": {
    className: "text-primary-foreground",
    variable: "--wearly-primary-foreground",
  },
  secondary: {
    className: "text-secondary-foreground",
    variable: "--wearly-secondary-foreground",
  },
  "secondary-foreground": {
    className: "text-secondary-foreground",
    variable: "--wearly-secondary-foreground",
  },
  success: {
    className: "text-success-foreground",
    variable: "--wearly-success-foreground",
  },
  "success-foreground": {
    className: "text-success-foreground",
    variable: "--wearly-success-foreground",
  },
  warning: {
    className: "text-warning-foreground",
    variable: "--wearly-warning-foreground",
  },
  "warning-foreground": {
    className: "text-warning-foreground",
    variable: "--wearly-warning-foreground",
  },
} as const;

export type Tone = keyof typeof TONE;

/** The Tailwind utility for a tone. Also registers the variable with Uniwind. */
export function toneClassName(tone: Tone): string {
  return TONE[tone].className;
}

/**
 * The resolved colour for a tone, for anything that cannot take a className —
 * `react-native-svg` in practice. Re-renders when the theme changes, because
 * Uniwind re-publishes theme variables.
 */
export function useToneColor(tone: Tone): string {
  return String(useCSSVariable(TONE[tone].variable) ?? "");
}
