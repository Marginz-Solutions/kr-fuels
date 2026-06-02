"use client";
import { useEffect, useState } from "react";

/**
 * SSR-safe media-query hook. Returns `false` on the server and the first client
 * render (avoids hydration mismatches), then the real match once mounted.
 * Single shared source so screens stop reinventing `window.innerWidth` listeners.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Convenience: `true` below the `md` breakpoint (default ≤767px). */
export function useIsMobile(breakpoint = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}
