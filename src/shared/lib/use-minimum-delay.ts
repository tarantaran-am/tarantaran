"use client";

import { useEffect, useState } from "react";

// False until `ms` have passed since the page started loading, then true. Counted from navigation
// start rather than from mount, so a slow hydration does not add the delay on top.
export function useMinimumDelay(ms: number): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), Math.max(0, ms - performance.now()));
    return () => clearTimeout(timer);
  }, [ms]);

  return elapsed;
}
