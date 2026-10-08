import { SPRING } from "@wearly/design-tokens/motion";
import { View } from "react-native";
import Animated, {
  LinearTransition,
  useReducedMotion,
} from "react-native-reanimated";

export interface StepDotsProps {
  /** Zero-based position in the flow. */
  current: number;
  total: number;
}

/** Stable dot keys — the flow has three steps and never grows silently. */
const DOT_KEYS = ["one", "two", "three"] as const;

/**
 * The one progress language of onboarding.
 *
 * Three dots; the active one is wider rather than a different colour. The width
 * change runs through a layout transition on the travelling-indicator spring,
 * so moving between screens glides the pill across instead of popping it —
 * the same "one object moving within the control" idea as the tab bar. Under
 * reduced motion the change is instant.
 */
export function StepDots({ current, total }: StepDotsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <View
      accessibilityLabel={`Step ${current + 1} of ${total}`}
      className="h-4 flex-row items-center justify-center gap-2"
    >
      {DOT_KEYS.slice(0, total).map((dot, index) => (
        <Animated.View
          className={[
            "h-2 rounded-pill",
            index === current ? "w-5 bg-primary" : "w-2 bg-muted",
          ].join(" ")}
          key={dot}
          layout={
            reduceMotion
              ? undefined
              : LinearTransition.springify()
                  .damping(SPRING.tab.damping)
                  .stiffness(SPRING.tab.stiffness)
          }
        />
      ))}
    </View>
  );
}
