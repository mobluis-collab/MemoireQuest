"use client";

import { useState, useEffect } from "react";

export function AnimNum({ value, dur = 1200 }: { value: number; dur?: number }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    let s = 0;
    const fn = (ts: number) => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      setD(Math.floor((1 - Math.pow(1 - p, 4)) * value));
      if (p < 1) requestAnimationFrame(fn);
    };
    requestAnimationFrame(fn);
  }, [value, dur]);
  return <>{d}</>;
}
