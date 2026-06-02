import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, HelpCircle } from "lucide-react";
import { getFuelPrices, getCalculatorSettings, getFaq } from "@/lib/api";
import { Calculators } from "@/components/Calculators";
import { normalizeUrl } from "@kr/shared/lib/utils";
import { FAQ_FALLBACK } from "@/lib/fallbacks";

export const metadata: Metadata = {
  title: "Learn — Savings & Carbon Calculators",
  description: "Auto LPG vs Domestic LPG, savings & carbon calculators, and frequently asked questions.",
};

// ISR: calculator inputs use live prices; FAQ/settings change infrequently.
export const revalidate = 120;

const COMPARISON = [
  ["Purpose", "Vehicles (automotive)", "Cooking (household)"],
  ["Pressure rating", "High-pressure certified tanks", "Low-pressure cylinders"],
  ["Composition", "Optimised propane/butane mix", "Standard cooking mix"],
  ["Legal for vehicles", "yes", "no"],
  ["Dispensed at", "Auto LPG stations", "Home delivery"],
  ["Safety standard", "BIS automotive certified", "Domestic cylinder norms"],
];

export default async function LearnPage() {
  const [prices, settings, faq] = await Promise.all([getFuelPrices(), getCalculatorSettings(), getFaq()]);
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

      {/* Comparison */}
      <section className="container-x py-16">
        <h2 className="section-title mb-6 text-center">Auto LPG vs Domestic LPG</h2>
        <div className="overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand text-white">
                <th className="p-4 text-left font-semibold"> </th>
                <th className="p-4 text-left font-semibold">Auto LPG</th>
                <th className="p-4 text-left font-semibold">Domestic LPG</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} className={i % 2 ? "bg-cream" : "bg-white"}>
                  <td className="p-4 font-medium text-ink">{row[0]}</td>
                  {[row[1], row[2]].map((cell, c) => (
                    <td key={c} className="p-4 text-mutedfg">
                      {cell === "yes" ? <Check className="text-brand" size={18} /> : cell === "no" ? <X className="text-red-500" size={18} /> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Calculators */}
      <section id="calculators" className="bg-cream py-16">
        <div className="container-x">
          <h2 className="section-title mb-8 text-center">Calculate Your Savings & Impact</h2>
          <Calculators prices={prices} settings={settings} />
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
