"use client";
import { useState } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

export interface TestimonialItem {
  id: string;
  name: string;
  designation?: string;
  company?: string;
  message: string;
  image?: string;
  rating?: number;
}

export function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const [i, setI] = useState(0);
  if (!items.length) return null;

  const go = (d: number) => setI((p) => (p + d + items.length) % items.length);
  const t = items[i];
  const rating = t.rating ?? 5;
  const role = [t.designation, t.company].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card-soft relative px-8 py-10 text-center">
        <Quote className="mx-auto mb-4 text-brand" size={36} />
        <div className="mb-5 flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, s) => (
            <Star key={s} size={18} className={s < rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
          ))}
        </div>
        <p className="text-lg leading-relaxed text-ink/85">“{t.message}”</p>
        <div className="mt-7 flex items-center justify-center gap-3">
          {t.image ? (
            <Image src={t.image} alt={t.name} width={48} height={48} unoptimized className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-pale" />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-pale font-bold text-brand">{t.name.charAt(0)}</span>
          )}
          <div className="text-left">
            <div className="font-bold text-ink">{t.name}</div>
            {role && <div className="text-sm text-mutedfg">{role}</div>}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-brand-pale" aria-label="Previous">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {items.map((_, d) => (
              <button key={d} onClick={() => setI(d)} className={`h-2 rounded-full transition-all ${d === i ? "w-6 bg-brand" : "w-2 bg-black/15"}`} aria-label={`Go to ${d + 1}`} />
            ))}
          </div>
          <button onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-brand-pale" aria-label="Next">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
