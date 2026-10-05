import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, View } from "react-native";

import { Icon } from "./icon";
import { Text } from "./text";

/**
 * Toasts.
 *
 * A small, honest notification system: a queue, a visible region, and an error
 * path that always says what went wrong. Validation failures are surfaced here
 * as well as inline on the field, because a field error alone is easy to miss.
 *
 * The surface is token-coloured and the message is a `*-foreground` pair, so it
 * stays legible in both themes without a single hex value.
 */

export type ToastTone = "error" | "info" | "success";

const TOAST_TONE = {
  error: {
    surface: "bg-destructive-background",
    text: "destructive-foreground",
  },
  info: { surface: "bg-info-background", text: "info-foreground" },
  success: { surface: "bg-success-background", text: "success-foreground" },
} as const;

const TOAST_ICON = {
  error: "close",
  info: "sparkles",
  success: "check",
} as const;

const VISIBLE_MS = 3200;

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

interface ToastApi {
  dismiss: () => void;
  show: (text: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Mount once, near the root. Renders whatever is currently queued. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current === null) {
      setMessage(null);
      return;
    }
    clearTimeout(timer.current);
    timer.current = null;
    setMessage(null);
  }, []);

  const show = useCallback((text: string, tone: ToastTone = "info") => {
    nextId.current += 1;
    setMessage({ id: nextId.current, text, tone });
    if (timer.current === null) {
      // Nothing pending — the first message of a burst needs no reset.
    } else {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setMessage(null), VISIBLE_MS);
  }, []);

  const api = useMemo<ToastApi>(() => ({ dismiss, show }), [dismiss, show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {message ? (
        <ToastView key={message.id} message={message} onDismiss={dismiss} />
      ) : null}
    </ToastContext.Provider>
  );
}

/** The one way a screen raises a message. Throws outside a provider. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api === null) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return api;
}

interface ToastViewProps {
  message: ToastMessage;
  onDismiss: () => void;
}

function ToastView({ message, onDismiss }: ToastViewProps) {
  return (
    <View className="pointer-events-none absolute inset-x-0 top-0 z-50 items-center px-gutter pt-16">
      <Pressable
        accessibilityHint="Dismisses this message"
        accessibilityLabel={message.text}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        className={`w-full max-w-md flex-row items-center gap-3 rounded-card border border-border px-4 py-3 ${TOAST_TONE[message.tone].surface}`}
        onPress={onDismiss}
      >
        <View className="size-8 items-center justify-center rounded-pill bg-card">
          <Icon
            name={TOAST_ICON[message.tone]}
            size="sm"
            tone={TOAST_TONE[message.tone].text}
          />
        </View>
        <Text
          className="flex-1"
          tone={TOAST_TONE[message.tone].text}
          variant="bodySm"
        >
          {message.text}
        </Text>
      </Pressable>
    </View>
  );
}
