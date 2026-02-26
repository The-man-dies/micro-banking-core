import fs from "fs";
import path from "path";
import winston from "winston";

const { combine, timestamp, printf, colorize, align, errors, splat, metadata } =
  winston.format;

const buildLine = (info: winston.Logform.TransformableInfo) => {
  const meta =
    info.metadata && Object.keys(info.metadata).length > 0
      ? ` ${JSON.stringify(info.metadata)}`
      : "";
  const stack = info.stack ? `\n${info.stack}` : "";
  return `[${info.timestamp}] ${info.level}: ${info.message}${meta}${stack}`;
};

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  align(),
  errors({ stack: true }),
  splat(),
  metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
  printf(buildLine),
);

const fileFormat = combine(
  timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  align(),
  errors({ stack: true }),
  splat(),
  metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
  printf(buildLine),
);

const logDir = process.env.LOG_DIR || path.join(process.cwd(), "logs");
const logFile = process.env.LOG_FILE || path.join(logDir, "server.log");

try {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
} catch {
  // If log dir creation fails, we still keep console logging.
}

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true,
  }),
];

if (logFile) {
  transports.push(
    new winston.transports.File({
      filename: logFile,
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true,
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports,
  exitOnError: false,
});

export default logger;
