"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// Auto-rotating hero slideshow. Cross-fades through the supplied images on a fixed
// interval; dots allow manual selection. Falls back to a single static image when
// only one is supplied.
export function HeroCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % images.length), 4000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-line shadow-[0_20px_60px_rgba(13,26,16,0.12)]">
      {/* Loading skeleton until the first slide has loaded */}
      {!ready && <span aria-hidden className="absolute inset-0 z-0 animate-pulse bg-line" />}
      {images.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority={idx === 0}
          onLoad={idx === 0 ? () => setReady(true) : undefined}
          sizes="(max-width:1024px) 100vw, 580px"
          className={`object-cover transition-opacity duration-1000 ease-in-out ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
