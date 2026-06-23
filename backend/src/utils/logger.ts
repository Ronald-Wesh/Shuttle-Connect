type LogLevel = "debug" | "info" | "warn" | "error";

const shouldLogDebug = process.env.NODE_ENV !== "production";

const write = (level: LogLevel, message: string, meta?: unknown) => {
  if (level === "debug" && !shouldLogDebug) {
    return;
  }

  const payload = meta ? ` ${JSON.stringify(meta)}` : "";
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${payload}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const logger = {
  debug: (message: string, meta?: unknown) => write("debug", message, meta),
  info: (message: string, meta?: unknown) => write("info", message, meta),
  warn: (message: string, meta?: unknown) => write("warn", message, meta),
  error: (message: string, meta?: unknown) => write("error", message, meta)
};
