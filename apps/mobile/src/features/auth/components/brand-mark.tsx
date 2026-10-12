import {
  FlowMarkBaseSvg,
  FlowMarkFlourishSvg,
  LOGO_ASPECT,
} from "@features/splash/components/wearly-flow-mark";
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
 */

/** Wordmark type size (`headingMd`), so the mark matches the title. */
const MARK_HEIGHT = 24;

export function BrandMark() {
  const { theme } = useUniwind();
  const palette = theme === "dark" ? FLOW_MARK_DARK : FLOW_MARK_LIGHT;
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
