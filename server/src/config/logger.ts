import fs from "fs";
import path from "path";
import winston from "winston";

const { combine, timestamp, printf, colorize, align } = winston.format;

const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  align(),
  printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
);

const fileFormat = combine(
  timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  align(),
  printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
);

const logDir = process.env.LOG_DIR || path.join(process.cwd(), "logs");
const logFile = process.env.LOG_FILE || path.join(logDir, "server.log");

try {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
} catch {
  // If log dir creation fails, we still keep console logging.
}

const transports: winston.transport[] = [
  new winston.transports.Console({ format: consoleFormat }),
];

if (logFile) {
  transports.push(
    new winston.transports.File({
      filename: logFile,
      format: fileFormat,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  transports,
});

export default logger;
