import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, HelpCircle, Fuel, Flame, type LucideIcon } from "lucide-react";
import { getFaq } from "@/lib/api";
import { normalizeUrl } from "@kr/shared/lib/utils";
import { FAQ_FALLBACK } from "@/lib/fallbacks";

export const metadata: Metadata = {
  title: "Learn — Auto LPG vs Domestic LPG",
  description: "Auto LPG vs Domestic LPG compared, and frequently asked questions about switching.",
};

// ISR: FAQ/settings change infrequently — serve from cache, refresh in background.
export const revalidate = 120;

const COMPARISON = [
  ["Purpose", "Vehicles (automotive)", "Cooking (household)"],
  ["Pressure rating", "High-pressure certified tanks", "Low-pressure cylinders"],
  ["Composition", "Optimised propane/butane mix", "Standard cooking mix"],
  ["Legal for vehicles", "yes", "no"],
  ["Dispensed at", "Auto LPG stations", "Home delivery"],
  ["Safety standard", "BIS automotive certified", "Domestic cylinder norms"],
];

const COLUMNS: { title: string; sub: string; icon: LucideIcon; idx: number; highlight: boolean }[] = [
  { title: "Auto LPG", sub: "Automotive grade — for vehicles", icon: Fuel, idx: 1, highlight: true },
  { title: "Domestic LPG", sub: "Cooking grade — for households", icon: Flame, idx: 2, highlight: false },
];

// Renders a comparison value: yes/no become coloured pills, everything else is text.
function Cell({ v }: { v: string }) {
  if (v === "yes") return <span className="inline-flex items-center gap-1.5 font-semibold text-brand"><Check size={16} /> Permitted</span>;
  if (v === "no") return <span className="inline-flex items-center gap-1.5 font-semibold text-red-500"><X size={16} /> Not permitted</span>;
  return <span className="font-semibold text-ink">{v}</span>;
}

export default async function LearnPage() {
  const faq = await getFaq();
  // Real FAQ from the backend wins; fall back to common questions when empty.
  const faqList = faq.length ? faq : FAQ_FALLBACK;

  return (
    <>
      <section className="bg-gradient-to-b from-brand-pale/60 to-white">
        <div className="container-x py-14 text-center">
          <span className="eyebrow mb-4">Learn</span>
          <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">Everything About Auto LPG</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mutedfg">
            Understand the savings, the environmental impact and how Auto LPG differs from domestic LPG.
          </p>
        </div>
      </section>

      {/* Auto LPG vs Domestic LPG — side-by-side comparison cards */}
      <section className="container-x py-16">
        <div className="mb-8 text-center">
          <h2 className="section-title">Auto LPG vs Domestic LPG</h2>
          <p className="mx-auto mt-3 max-w-2xl text-mutedfg">
            They share a name, but they are engineered for entirely different jobs. Here&apos;s how they compare.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {COLUMNS.map((col) => (
            <div
              key={col.title}
              className={`card-soft ${col.highlight ? "ring-2 ring-brand/25" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${col.highlight ? "bg-brand text-white" : "bg-cream text-ink/60"}`}>
                  <col.icon size={24} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-ink">{col.title}</h3>
                    {col.highlight && <span className="rounded-full bg-brand-pale px-2 py-0.5 text-[11px] font-bold text-brand-dark">Recommended for vehicles</span>}
                  </div>
                  <p className="text-sm text-mutedfg">{col.sub}</p>
                </div>
              </div>
              <dl className="mt-6 space-y-3">
                {COMPARISON.map((row) => (
                  <div key={row[0]} className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm font-medium text-mutedfg">{row[0]}</dt>
                    <dd className="text-right text-sm"><Cell v={row[col.idx]} /></dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-x py-16">
        <div className="mb-8 text-center">
          <span className="grid mx-auto mb-3 h-11 w-11 place-items-center rounded-xl bg-brand-pale text-brand"><HelpCircle size={20} /></span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-3">
          {faqList.length === 0 ? (
            <p className="text-center text-mutedfg">FAQs will appear here soon.</p>
          ) : (
            faqList.map((f) => (
              <details key={f.id} className="card-soft group">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                  {f.question}
                  <span className="text-brand transition group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-sm text-mutedfg">
                  {f.isLink ? (
                    <Link href={normalizeUrl(f.answer)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">{f.answer}</Link>
                  ) : (
                    <p className="whitespace-pre-line">{f.answer}</p>
                  )}
                </div>
              </details>
            ))
          )}
        </div>
      </section>
    </>
  );
}
