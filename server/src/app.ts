import express from "express";
import { limiter } from "./middleware/limiter";
import cors from "cors";
import crypto from "node:crypto";
import api from "./api";

const app = express();
const SHUTDOWN_PATH = "/internal/shutdown";
const HEALTH_PATH = "/internal/health";

// Middleware
app.use(cors());
app.use(limiter);
app.use(express.json());

// API Routes
app.use("/api/v1", api);

// Health check route
app.get("/", (req, res) => {
  res.send("Mini Banking API is running");
});

app.get(HEALTH_PATH, (req, res) => {
  res.status(200).json({ status: "ok" });
});

const isLocalRequest = (ip?: string): boolean => {
  if (!ip) return false;
  if (ip === "127.0.0.1" || ip === "::1") return true;
  return ip.startsWith("::ffff:127.");
};

app.post(SHUTDOWN_PATH, (req, res) => {
  const shutdownToken = process.env.SHUTDOWN_TOKEN;
  const token = req.header("x-shutdown-token") as string | undefined;

  let tokensMatch = false;
  if (shutdownToken && token) {
    const expected = Buffer.from(shutdownToken);
    const received = Buffer.from(token);
    if (expected.length === received.length) {
      tokensMatch = crypto.timingSafeEqual(expected, received);
    }
  }

  if (!tokensMatch) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!isLocalRequest(req.ip)) {
    return res.status(403).json({ error: "Local requests only" });
  }

  res.status(202).json({ status: "Shutting down" });

  const shutdownFn = req.app.get("shutdown");
  if (typeof shutdownFn === "function") {
    shutdownFn("http");
  }
});

export default app;
