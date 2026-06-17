"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { ImageWithSkeleton } from "./ImageWithSkeleton";

// Station gallery images render UNOPTIMIZED — the original file straight from
// Firebase/the DB — for the two reasons the brief calls out:
//   1. Full quality: the optimizer recompresses to a smaller WebP/AVIF, so the
//      original URL is the only way to show the photo "fully fetched from the DB".
//   2. One cached file, reused everywhere: the grid tile, the full-screen view and
//      the thumbnail all point at the SAME original URL. Once the grid has loaded an
//      image the lightbox paints it instantly from the browser cache instead of
//      fetching a different optimized variant every time it is opened.

// The grid never grows past a 2×2 footprint. Extra images collapse into a
// "+N more" overlay on the last tile, which opens the full viewer.
const MAX_TILES = 4;

// Station Details image gallery + full-screen lightbox.
// - Uniform grid: EVERY image (including the first) is an equal-sized tile in one
//   single grid container. Each tile gets a hover overlay (dim + expand badge +
//   subtle zoom) and shows the whole image (object-contain) on a soft background.
// - Clicking any tile opens a full-screen viewer that shows the image in its
//   ORIGINAL aspect ratio (object-contain) and supports:
//     • Esc to close, ◄ / ► arrow keys to navigate
//     • on-screen prev/next buttons either side of the image
//     • a thumbnail strip for jump-to navigation
//   Styled entirely with our theme tokens (brand green, ink, line) so it matches
//   the rest of the site. The first image is the cover; the rest follow in order.
export function StationGallery({ images, stationName }: { images: string[]; stationName: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const next = useCallback(() => setIndex((p) => (p + 1) % count), [count]);
  const prev = useCallback(() => setIndex((p) => (p - 1 + count) % count), [count]);

  // Keyboard navigation + body scroll lock, only while the viewer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, next, prev]);

  if (count === 0) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl bg-cream text-ink/30">
        <MapPin size={48} />
      </div>
    );
  }

  return (
    <>
      {/* ── Uniform image grid — fixed 2×2 footprint ───────────────
          Beyond 4 images the grid size stays the same: the 4th tile shows a
          "+N more" overlay and opens the full viewer, where every image is
          reachable via the arrows and thumbnail strip. */}
      <div className="grid grid-cols-2 gap-3">
        {images.slice(0, MAX_TILES).map((src, i) => {
          const moreCount = i === MAX_TILES - 1 ? count - MAX_TILES : 0;
          return (
            <GalleryTile
              key={i}
              className={`aspect-4/3 bg-cream ${count === 1 ? "col-span-2" : ""}`}
              onClick={() => openAt(i)}
              label={
                moreCount > 0
                  ? `Open gallery — ${moreCount} more image${moreCount > 1 ? "s" : ""}`
                  : `Open ${stationName} image ${i + 1} in full screen`
              }
            >
              <ImageWithSkeleton
                src={src}
                alt={`${stationName} image ${i + 1}`}
                fill
                unoptimized
                loading={i === 0 ? "eager" : "lazy"}
                className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {moreCount > 0 && (
                <span className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink/60 font-bold text-white">
                  <span className="text-3xl leading-none">+{moreCount}</span>
                  <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/80">more</span>
                </span>
              )}
            </GalleryTile>
          );
        })}
      </div>

      {/* ── Full-screen lightbox ─────────────────────────────────── */}
      {open && (
        <div
          className="kr-fade-in fixed inset-0 z-120 flex select-none flex-col bg-ink/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={`${stationName} image gallery`}
          onClick={close}
        >
          {/* Top bar: counter + close */}
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <span
              className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white/90 backdrop-blur"
              onClick={(e) => e.stopPropagation()}
            >
              {index + 1} <span className="text-white/50">/ {count}</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="Close gallery"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stage: prev button · image · next button */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 sm:px-16">
            {count > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:scale-105 hover:bg-white/25 sm:left-5 sm:h-12 sm:w-12"
              >
                <ChevronLeft size={26} />
              </button>
            )}

            <div className="kr-pop-in relative h-full w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              {images.map((src, i) => (
                <div
                  key={i}
                  aria-hidden={i !== index}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
                    i === index
                      ? "z-10 translate-x-0 scale-100 opacity-100"
                      : i < index
                        ? "-translate-x-6 scale-95 opacity-0"
                        : "translate-x-6 scale-95 opacity-0"
                  }`}
                >
                  {/* The image sizes to its OWN aspect ratio (capped by the stage via
                      max-h/max-w), so the 5px white border hugs it tightly on every
                      side instead of a fixed-ratio white panel with letterbox margins.
                      Rendered straight from the original DB URL (no next/image
                      optimizer) so it shows full quality and reuses the very file the
                      grid already cached — no re-fetch when the viewer re-opens. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${stationName} image ${i + 1}`}
                    loading={i === index ? "eager" : "lazy"}
                    draggable={false}
                    className="block max-h-full max-w-full rounded-2xl border-[5px] border-white bg-white object-contain shadow-2xl"
                  />
                </div>
              ))}
            </div>

            {count > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:scale-105 hover:bg-white/25 sm:right-5 sm:h-12 sm:w-12"
              >
                <ChevronRight size={26} />
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {count > 1 && (
            <div
              className="flex justify-center gap-2 overflow-x-auto px-4 py-4 sm:py-5"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={i === index}
                  className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-14 sm:w-20 ${
                    i === index
                      ? "border-brand-light opacity-100"
                      : "border-transparent opacity-50 hover:opacity-90"
                  }`}
                >
                  <Image src={src} alt="" fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// A single clickable gallery tile with a hover overlay (dim + expand badge).
function GalleryTile({
  children,
  className,
  onClick,
  label,
}: {
  children: React.ReactNode;
  className: string;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${className}`}
    >
      {children}
      {/* Dim layer */}
      <span aria-hidden className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/25" />
      {/* Expand badge */}
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <span className="grid h-11 w-11 scale-90 place-items-center rounded-full bg-white/95 text-ink shadow-lg backdrop-blur transition-transform duration-300 group-hover:scale-100">
          <Maximize2 size={18} />
        </span>
      </span>
    </button>
  );
}
