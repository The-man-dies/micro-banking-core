#!/usr/bin/env node

const HEALTH_URL =
  process.env.SERVER_HEALTH_URL || "http://127.0.0.1:3000/internal/health";

async function main() {
  try {
    const res = await fetch(HEALTH_URL);
    const text = await res.text();
    console.log(`Health check (${HEALTH_URL}): ${res.status}`);
    console.log(text);
  } catch (error) {
    console.error("Health check failed:", error);
    process.exit(1);
  }
}

void main();
