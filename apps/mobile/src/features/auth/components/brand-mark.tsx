import {
  FlowMarkBaseSvg,
  FlowMarkFlourishSvg,
  LOGO_ASPECT,
} from "@features/splash/components/wearly-flow-mark";
import type { FlowMarkPalette } from "@features/splash/splash-theme";
import { FLOW_MARK_DARK, FLOW_MARK_LIGHT } from "@features/splash/splash-theme";
import { View } from "react-native";
import { useUniwind } from "uniwind";

/**
 * The brand lockup's mark.
 *
 * Both layers are the splash's generated geometry — base (W + lower leaf) with
 * the flourish leaf overlaid, the same composition the splash logo uses — so
 * the mark beside a wordmark is byte-identical to the one on the splash.
 * Sized to the wordmark's optical height rather than a guessed width, and
 * theme-aware like the splash, because the rose family deepens in dark mode.
 *
 * `onPrimary` is the exception: over `bg-primary` the theme's rose palette
 * would rose-on-rose and vanish, so the mark goes white — the same
 * `primary-foreground` the wordmark beside it is set in.
 */

/** Wordmark type size (`headingMd`), so the mark matches the title. */
const MARK_HEIGHT = 24;

/** White stops for `bg-primary` surfaces (the auth banner); identical in both themes. */
const FLOW_MARK_ON_PRIMARY: FlowMarkPalette = {
  "wearly-leaf-bottom-gradient": [
    "rgba(255,255,255,0.45)",
    "rgba(255,255,255,0.55)",
    "rgba(255,255,255,0.65)",
  ],
  "wearly-leaf-top-gradient": [
    "rgba(255,255,255,0.5)",
    "rgba(255,255,255,0.65)",
    "rgba(255,255,255,0.8)",
  ],
  "wearly-w-gradient": ["#FFFFFF", "#FFFFFF", "#FFFFFF"],
};

export interface BrandMarkProps {
  /** Render for a `bg-primary` backdrop instead of the themed one. */
  onPrimary?: boolean;
}

function pickPalette(onPrimary: boolean, theme: string): FlowMarkPalette {
  if (onPrimary) {
    return FLOW_MARK_ON_PRIMARY;
  }
  return theme === "dark" ? FLOW_MARK_DARK : FLOW_MARK_LIGHT;
}

export function BrandMark({ onPrimary = false }: BrandMarkProps) {
  const { theme } = useUniwind();
  const palette = pickPalette(onPrimary, theme);
  const width = MARK_HEIGHT / LOGO_ASPECT;

  return (
    <View aria-hidden>
      <FlowMarkBaseSvg palette={palette} width={width} />
      <View className="absolute inset-0" pointerEvents="none">
        <FlowMarkFlourishSvg palette={palette} width={width} />
      </View>
    </View>
  );
}
