"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Resets the window to the top of the page on every route change. Anchor
// navigations (URLs carrying a #hash, e.g. /learn#faq or /products#tanks-multivalves)
// are left alone so the browser/Next.js can scroll to the target section instead.
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
