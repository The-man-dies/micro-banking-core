import { useState, useEffect } from 'react';

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
    formatted: 'Expired',
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
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const formatted = `${days.toString().padStart(2, '0')}J / ${hours.toString().padStart(2, '0')}H / ${minutes.toString().padStart(2, '0')}M / ${seconds.toString().padStart(2, '0')}S`;

    return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        formatted,
    };
};

export const useCountdown = (expiresAt: string): Countdown => {
    const [countdown, setCountdown] = useState<Countdown>(() => calculateTimeRemaining(expiresAt));

    useEffect(() => {
        if (countdown.isExpired) {
            return;
        }

        const timer = setInterval(() => {
            setCountdown(calculateTimeRemaining(expiresAt));
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt, countdown.isExpired]);

    return countdown;
};
