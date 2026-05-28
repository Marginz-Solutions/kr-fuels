// ─── TestimonialsSection ──────────────────────────────────────────────────────

"use client";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchTestimonials } from "@/lib/api/testimonials";
import TestimonialCard from "./Testimonialcard";
import Loading from "../loading";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BREAKPOINTS = { md: 768, lg: 1024 } as const;

function useColumns(): number {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () =>
      setCols(
        window.innerWidth < BREAKPOINTS.md
          ? 1
          : window.innerWidth < BREAKPOINTS.lg
          ? 2
          : 3
      );
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TrustBadge: FC = () => (
  <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/70 text-teal-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 select-none">
    <Star className="w-3.5 h-3.5 fill-teal-600 text-teal-600" aria-hidden="true" />
    Customer Testimonials
  </div>
);

const EmptyState: FC = () => (
  <div className="col-span-full flex flex-col items-center py-24 text-center">
    <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
      <Star className="w-7 h-7 text-teal-500" aria-hidden="true" />
    </div>
    <h3 className="text-gray-700 font-semibold text-base mb-1">No testimonials yet</h3>
    <p className="text-gray-400 text-sm max-w-xs">
      Customer reviews will appear here once they are published.
    </p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const TestimonialsSection: FC = () => {
  // ── Fetch active testimonials ──────────────────────────────────────────────
  const {
  data: testimonials = [],
  isLoading,
} = useQuery({
  queryKey: ["testimonials"],        
  queryFn: fetchTestimonials,        
  staleTime: 5 * 60 * 1000,
});

  const cols = useColumns();
  const [page, setPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(testimonials.length / cols);
  const visible = testimonials.slice(page * cols, (page + 1) * cols);

  // Reset to page 0 when viewport changes column count
  useEffect(() => setPage(0), [cols]);

  const goTo = useCallback(
    (p: number) => {
      if (p < 0 || p >= totalPages) return;
      setPage(p);
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    [totalPages]
  );

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const ratedItems = testimonials.filter((t) => t.rating !== undefined);
  const avgRating =
    ratedItems.length > 0
      ? (ratedItems.reduce((s, t) => s + (t.rating ?? 0), 0) / ratedItems.length).toFixed(1)
      : null;

  return (
    <section
      className="relative py-20 sm:py-28 bg-gradient-to-b from-[#f0f5f3] to-white overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      {/* Decorative background blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-teal-50 opacity-50 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-teal-100 opacity-30 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-14">
          <TrustBadge />
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4"
          >
            What Our Customers{" "}
            <span className="text-teal-700">Say About Us</span>
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl">
            Trusted by fleets, businesses, and industries across Tamil Nadu. Here&apos;s
            what our customers say about KR Fuels&apos; reliability, quality, and service.
          </p>

          {/* Aggregate rating strip */}
          {avgRating && !isLoading && (
            <div className="mt-8 flex items-center gap-5 sm:gap-8 flex-wrap justify-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl font-bold text-gray-900 leading-none">
                  {avgRating}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-teal-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  Average rating · {ratedItems.length} reviews
                </span>
              </div>

              <div className="w-px h-12 bg-gray-200 hidden sm:block" aria-hidden="true" />

              <p className="text-sm text-gray-600 max-w-xs text-left">
                <span className="font-semibold text-gray-900">Trusted by 500+</span>{" "}
                customers and fleet operators across Tamil Nadu
              </p>
            </div>
          )}
        </div>

        {/* Card grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          role="list"
          aria-label="Customer testimonials"
        >
          {isLoading
            ? Array.from({ length: 3 }, (_, i) => <Loading key={i} />)
            : visible.length === 0
            ? <EmptyState />
            : visible.map((t) => (
                <div key={t.id} role="listitem" className="flex">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <nav
            className="flex items-center justify-center gap-4 mt-12"
            aria-label="Testimonials pagination"
          >
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              aria-label="Previous page"
              className={[
                "w-10 h-10 rounded-full border flex items-center justify-center",
                "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                page === 0
                  ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-500 hover:border-teal-500 hover:text-teal-600",
              ].join(" ")}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2" role="tablist">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === page}
                  aria-label={`Page ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={[
                    "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                    i === page
                      ? "w-6 h-2.5 bg-teal-600"
                      : "w-2.5 h-2.5 bg-gray-200 hover:bg-teal-200",
                  ].join(" ")}
                />
              ))}
            </div>

            <button
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages - 1}
              aria-label="Next page"
              className={[
                "w-10 h-10 rounded-full border flex items-center justify-center",
                "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                page === totalPages - 1
                  ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-500 hover:border-teal-500 hover:text-teal-600",
              ].join(" ")}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;