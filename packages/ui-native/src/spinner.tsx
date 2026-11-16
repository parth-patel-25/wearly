import { ActivityIndicator } from "react-native";

import { useToneColor } from "./tone";

/**
 * Themed spinner.
 *
 * A small, in-house wrapper over React Native's `ActivityIndicator` so every
 * loading surface resolves its colour from the design tokens instead of a
 * hard-coded hex. Use it for OAuth sign-in, image loads, and any other async
 * wait where a full skeleton block would be too heavy.
 */
export interface SpinnerProps {
  /** "small" (default) or "large". */
  size?: "large" | "small" | number;
  /** Semantic tone; defaults to `primary`. */
  tone?: Parameters<typeof useToneColor>[0];
}

export function Spinner({ size = "small", tone = "primary" }: SpinnerProps) {
  const color = useToneColor(tone);
  return <ActivityIndicator color={color} size={size} />;
}

export { Spinner as default };
