"use client";

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

type FlashSaleTimerProps = {
  expiresAt: string;
};

export function FlashSaleTimer({ expiresAt }: FlashSaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(expiresAt).getTime() - now;

      if (distance < 0) {
        setTimeLeft("EXPIRED");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor((distance / (1000 * 60 * 60)));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-tighter text-rose-600">
      <Timer className="size-3" />
      {timeLeft}
    </div>
  );
}