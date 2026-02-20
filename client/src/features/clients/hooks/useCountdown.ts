import { useState, useEffect } from "react";
import { type ClientAccountStatus } from "../types";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

const EXPIRED_COUNTDOWN: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isExpired: true,
  formatted: "Expiré",
};

const calculateTimeRemaining = (expiresAt: string): Countdown => {
  const expirationDate = new Date(expiresAt).getTime();

  if (Number.isNaN(expirationDate)) {
    return EXPIRED_COUNTDOWN;
  }

  const now = new Date().getTime();
  const difference = expirationDate - now;

  if (difference <= 0) {
    return EXPIRED_COUNTDOWN;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  const formatted = `${days.toString().padStart(2, "0")}J / ${hours.toString().padStart(2, "0")}H / ${minutes.toString().padStart(2, "0")}M / ${seconds.toString().padStart(2, "0")}S`;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted,
  };
};

export const useCountdown = (
  expiresAt: string,
  status: ClientAccountStatus,
): Countdown => {
  const [countdown, setCountdown] = useState<Countdown>(() =>
    calculateTimeRemaining(expiresAt),
  );

  useEffect(() => {
    if (status === "expired" || countdown.isExpired) {
      return;
    }

    // Update state asynchronously to avoid synchronous setState inside effect
    const init = setTimeout(() => {
      setCountdown(calculateTimeRemaining(expiresAt));
    }, 0);

    const timer = setInterval(() => {
      const timeLeft = calculateTimeRemaining(expiresAt);
      setCountdown(timeLeft);

      if (timeLeft.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(init);
    };
  }, [expiresAt, countdown.isExpired, status]);
  if (status === "expired") {
    return EXPIRED_COUNTDOWN;
  }

  return countdown;
};
