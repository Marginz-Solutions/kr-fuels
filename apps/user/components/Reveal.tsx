"use client";
import { useEffect, useRef, useState } from "react";

type Direction = "up" | "left" | "right";

// Off-screen starting transform per direction — a generous offset gives the
// timeline its "parallax" feel as each card slides + fades into place.
const HIDDEN: Record<Direction, string> = {
  up: "translate-y-10 opacity-0",
  left: "-translate-x-12 opacity-0",
  right: "translate-x-12 opacity-0",
};

// Lightweight scroll-triggered reveal: fades + slides its children into view the
// first time they enter the viewport (IntersectionObserver, no dependencies).
export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          ob.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? "translate-x-0 translate-y-0 opacity-100" : HIDDEN[direction]} ${className}`}
    >
      {children}
    </div>
  );
}
