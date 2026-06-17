"use client";
import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

// next/image wrapper that shows an admin-style `animate-pulse bg-line` skeleton while
// the image is still fetching, then cross-fades the image in once it has loaded.
// Intended for `fill` images placed inside a positioned (relative, overflow-hidden)
// container — the skeleton overlays that same box.
export function ImageWithSkeleton({ className = "", onLoad, alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Cached images can finish loading before React attaches the onLoad handler, so
  // check the element's `complete` flag on mount as a fallback.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <>
      {!loaded && <span aria-hidden className="absolute inset-0 z-0 animate-pulse bg-line" />}
      <Image
        ref={ref}
        alt={alt}
        {...props}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={`${className} transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}
