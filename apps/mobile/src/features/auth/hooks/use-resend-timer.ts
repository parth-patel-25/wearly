import { useEffect, useState } from "react";

const COUNTDOWN_SECONDS = 40;

export function useResendTimer() {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [remaining]);

  const restart = () => setRemaining(COUNTDOWN_SECONDS);

  const format = () => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return {
    canResend: remaining === 0,
    formatted: format(),
    remaining,
    restart,
  };
}
