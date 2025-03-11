import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

// Custom format for pretty console logging
const prettyConsoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? Object.keys(meta).filter((key) => key !== "service").length
        ? ` | ${JSON.stringify(meta, null, 0)}`
        : ""
      : "";

    return `[${timestamp}] ${level} [${meta.service || "order-update"}]: ${message}${metaString}`;
  })
);

// Create a logger instance
const logger = winston.createLogger({
  level: Bun.env.LOG_LEVEL || "info",
  defaultMeta: { service: "order-update" },
  transports: [
    new winston.transports.Console({
      format: prettyConsoleFormat,
    }),
  ],
});

// Export for use in other files
export default logger;
