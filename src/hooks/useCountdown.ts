"use client";

import { formatCountdown } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useCountdown(targetDate: string | null) {
  const [countdown, setCountdown] = useState(() => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return formatCountdown(new Date(targetDate));
  });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate);
    const tick = () => setCountdown(formatCountdown(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return countdown;
}
