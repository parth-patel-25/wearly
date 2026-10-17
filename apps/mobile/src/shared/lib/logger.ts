type LogContext = Error | Record<string, unknown> | unknown;

function serialize(context?: LogContext): string {
  if (context === undefined) {
    return "";
  }
  if (context instanceof Error) {
    return `${context.name}: ${context.message}`;
  }
  if (typeof context === "object" && context !== null) {
    try {
      return JSON.stringify(context);
    } catch {
      return String(context);
    }
  }
  return String(context);
}

export function createLogger(scope: string) {
  const tag = `[${scope}]`;

  return {
    debug: (message: string, context?: LogContext) => {
      if (__DEV__) {
        console.debug(tag, message, serialize(context));
      }
    },
    error: (message: string, context?: LogContext) => {
      console.error(tag, message, serialize(context));
    },
    info: (message: string, context?: LogContext) => {
      if (__DEV__) {
        console.info(tag, message, serialize(context));
      }
    },
    warn: (message: string, context?: LogContext) => {
      console.warn(tag, message, serialize(context));
    },
  };
}

export const logger = createLogger("App");
