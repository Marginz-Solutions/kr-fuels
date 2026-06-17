"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Floating "back to top" button — appears once the user has scrolled down a bit
// and smooth-scrolls the window to the top when clicked.
export function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-lg transition-all hover:bg-brand-dark ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
