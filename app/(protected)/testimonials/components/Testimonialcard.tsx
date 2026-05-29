// ─── TestimonialCard ─────────────────────────────────────────────────────────
// Public-facing testimonial card. Color theme updated to teal (C.p tokens).

import { Testimonial } from "@/types";
import type { FC } from "react";
import StarRating from "./Starrating";
import TestimonialAvatar from "./Testimonialavatar";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: FC<TestimonialCardProps> = ({ testimonial }) => {
  const { name, designation, company, message, image, rating } = testimonial;

  const byline = [designation, company].filter(Boolean).join(" · ");

  return (
    <article
      className={[
        "group relative flex flex-col h-full",
        "bg-white rounded-2xl p-6",
        "border border-gray-100",
        "shadow-[0_2px_12px_0_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]",
        "hover:border-teal-200",
        "hover:-translate-y-1",
        "transition-all duration-300 ease-out",
        "outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
      ].join(" ")}
    >
      {/* ── Decorative quote mark ─────────────────────────────────────── */}
      <svg
        className="absolute top-5 right-5 w-9 h-9 text-teal-100 group-hover:text-teal-200 transition-colors duration-300 pointer-events-none"
        aria-hidden="true"
        viewBox="0 0 40 40"
        fill="currentColor"
      >
        <path d="M10 26c0-6.627 5.373-12 12-12v4c-4.418 0-8 3.582-8 8v2h4l-4 6H8l2-8zm14 0c0-6.627 5.373-12 12-12v4c-4.418 0-8 3.582-8 8v2h4l-4 6h-6l2-8z" />
      </svg>

      {/* ── Star rating (optional) ────────────────────────────────────── */}
      {rating !== undefined && (
        <div className="mb-4">
          <StarRating rating={rating} />
        </div>
      )}

      {/* ── Testimonial message ───────────────────────────────────────── */}
      <blockquote className="flex-1 mb-5">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-5">
          &ldquo;{message}&rdquo;
        </p>
      </blockquote>

      {/* ── Teal accent rule ──────────────────────────────────────────── */}
      <div className="w-8 h-0.5 bg-teal-600 mb-4 rounded-full" />

      {/* ── Author row ────────────────────────────────────────────────── */}
      <footer className="flex items-center gap-3 min-w-0">
        <TestimonialAvatar name={name} image={image} size="md" />
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {name}
          </div>
          {byline && (
            <div className="text-xs text-gray-500 mt-0.5 truncate" title={byline}>
              {byline}
            </div>
          )}
        </div>
      </footer>
    </article>
  );
};

export default TestimonialCard;