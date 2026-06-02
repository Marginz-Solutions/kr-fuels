import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Play, MapPin, ShieldCheck,
  HelpCircle, MessageSquare, GitCompare, Leaf,
} from "lucide-react";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { getFuelPrices, getStations, getTestimonials, getAbout, getClients } from "@/lib/api";
import { BRAND, OFFERINGS, TESTIMONIAL_FALLBACK } from "@/lib/site";
import { PARTNERS_FALLBACK } from "@/lib/fallbacks";

// ISR: home reflects live fuel prices — keep it fresh but served from cache.
export const revalidate = 30;

export default async function HomePage() {
  const [prices, stations, testimonials, about, partners] = await Promise.all([
    getFuelPrices(),
    getStations(),
    getTestimonials(),
    getAbout(),
    getClients("collaborator"),
  ]);

  const count = stations.total > 0 ? stations.total : 81;
  // Savings is computed live from today's prices; falls back to the brand figure (40%)
  // only when prices are unavailable, and is used consistently across the page.
  const savingsPct = prices.petrol > 0 && prices.autoLPG > 0 ? Math.round((1 - prices.autoLPG / prices.petrol) * 100) : 40;
  const savingsRs = prices.petrol > 0 && prices.autoLPG > 0 ? (prices.petrol - prices.autoLPG).toFixed(1) : "39";
  const p = (v: number) => (v > 0 ? v : "—");
  const carousel = testimonials.length ? testimonials : TESTIMONIAL_FALLBACK;
  const partnerList = partners.length ? partners : PARTNERS_FALLBACK;

  const stats = [
    { value: `${count}+`, label: "Stations across Tamil Nadu" },
    { value: `${savingsPct}%`, label: "Savings over petrol" },
    { value: "26M+", label: "Vehicles on Auto LPG worldwide" },
    { value: `${BRAND.yearsOfService}+`, label: "Years of trusted service" },
  ];

  const priceCells = [
    { l: "Auto-LPG", v: prices.autoLPG, live: true },
    { l: "Petrol", v: prices.petrol, live: false },
    { l: "Diesel", v: prices.diesel, live: false },
  ];

  const ctaCards = [
    { icon: MapPin, title: "Find a Station", sub: `${count}+ locations near you`, href: "/stations" },
    { icon: GitCompare, title: "LPG vs Domestic LPG", sub: "Know the real difference", href: "/learn" },
    { icon: MessageSquare, title: "Feedback", sub: "Share your experience", href: "/contact" },
    { icon: HelpCircle, title: "FAQ", sub: "Common questions answered", href: "/learn#faq" },
  ];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-brand-pale/60 to-white">
        <div className="container-x grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="eyebrow mb-6">🌿 Eco-Friendly Automotive Fuel — Since 2007</span>
            <h1 className="text-[44px] font-extrabold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-[68px]">
              Switch to Auto LPG. Save {savingsPct}%. <span className="text-brand">Drive Cleaner.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-mutedfg">
              Tamil Nadu&apos;s largest Auto LPG network. {count}+ stations. Cleaner fuel. Real savings every day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/stations" className="btn-primary">Find Nearest Station <ArrowRight size={16} /></Link>
              <Link href="#video" className="btn-dark"><Play size={16} /> Watch How It Works</Link>
            </div>
          </div>

          {/* Hero image + floating badges */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-line shadow-[0_20px_60px_rgba(13,26,16,0.12)]">
              <Image src="/assets/hero-2.jpg" alt="Auto LPG station" fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 580px" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
            </div>
            <div className="absolute -right-3 top-6 rounded-2xl border border-line bg-white px-4 py-3 shadow-lg">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mutedfg">Trusted</div>
              <div className="text-sm font-extrabold text-ink">Since 2007</div>
            </div>
            <div className="absolute -left-3 bottom-16 rounded-2xl border border-line bg-white px-4 py-3 shadow-lg">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mutedfg">Network</div>
              <div className="text-sm font-extrabold text-ink">{count}+ Stations</div>
            </div>
            <div className="absolute -right-3 bottom-6 rounded-2xl border border-line bg-white px-4 py-3 shadow-lg">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-mutedfg">Save</div>
              <div className="text-sm font-extrabold text-brand">{savingsPct}% Savings</div>
            </div>
          </div>
        </div>

        {/* Dark bottom price card */}
        <div className="container-x pb-14">
          <div className="grid grid-cols-2 gap-y-6 rounded-3xl bg-ink px-6 py-7 text-white sm:px-10 md:grid-cols-4 md:divide-x md:divide-white/10">
            {priceCells.map((c) => (
              <div key={c.l} className="md:px-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                  {c.l}{c.live && <span className="rounded-full bg-brand px-1.5 py-0.5 text-[9px] text-white">LIVE</span>}
                </div>
                <div className="mt-1 text-2xl font-extrabold">₹{p(c.v)}<span className="text-sm font-medium text-white/50">/lit</span></div>
              </div>
            ))}
            <div className="md:px-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Your Savings</div>
              <div className="mt-1 text-2xl font-extrabold text-brand-light">{savingsPct}% cheaper</div>
              <div className="text-xs text-white/60">Save ₹{savingsRs}/lit</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Numbers That Speak ───────────────────────────────── */}
      <section className="border-y border-line bg-white">
        <div className="container-x py-14">
          <h2 className="mb-10 text-center section-title">Numbers That Speak</h2>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl font-extrabold text-brand lg:text-5xl">{s.value}</div>
                <div className="mt-2 text-sm text-mutedfg">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story + Offerings ────────────────────────────────── */}
      <section className="container-x py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow mb-4">Our Story</span>
            <h2 className="section-title">Powering Green Mobility Since 2007</h2>
            <p className="mt-4 text-mutedfg">
              {about.contentBlocks?.[0]?.body ||
                `K.R Trans Fuels, a subsidiary of KRT Carriers, established its first Auto LPG Dispensing Station in 2007. Today, with ${count}+ stations across Tamil Nadu and more in the pipeline, we lead the state in cleaner automotive fuel.`}
            </p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-1.5 font-bold text-brand hover:gap-2.5 transition-all">
              Our Full Journey <ArrowRight size={16} />
            </Link>
            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-brand-pale p-5">
                <div className="text-3xl font-extrabold text-brand">{count} Stations</div>
                <div className="text-sm text-mutedfg">across Tamil Nadu</div>
              </div>
              <div className="rounded-2xl bg-brand-pale p-5">
                <div className="text-3xl font-extrabold text-brand">{savingsPct}%</div>
                <div className="text-sm text-mutedfg">Savings over Petrol</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-xl font-extrabold text-ink">What We Offer</h3>
            <div className="grid grid-cols-2 gap-4">
              {OFFERINGS.map((o) => (
                <div key={o.title} className="card-soft">
                  <div className="text-2xl">{o.emoji}</div>
                  <h4 className="mt-2 font-bold text-ink">{o.title}</h4>
                  <p className="mt-1 text-sm text-mutedfg">{o.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-white">
              <Leaf className="shrink-0 text-brand-light" size={24} />
              <div>
                <div className="font-bold">Eco-Friendly</div>
                <div className="text-sm text-white/70">Lower carbon emissions vs petrol — helping Tamil Nadu breathe cleaner, one tank at a time.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Video ────────────────────────────────────────────── */}
      <section id="video" className="scroll-mt-24 bg-cream py-20">
        <div className="container-x text-center">
          <span className="eyebrow mb-4">See It in Action</span>
          <h2 className="section-title">Watch How Auto LPG Conversion Works</h2>
          <div className="mx-auto mt-8 aspect-video max-w-3xl overflow-hidden rounded-3xl border border-line bg-ink shadow-lg">
            {about.videoUrl ? (
              <iframe className="h-full w-full" src={about.videoUrl} title="See it in action" allowFullScreen />
            ) : (
              <div className="grid h-full place-items-center text-white/60">
                <div className="text-center">
                  <span className="grid mx-auto mb-3 h-16 w-16 place-items-center rounded-full bg-brand text-white"><Play size={28} /></span>
                  <p>Auto LPG conversion — video coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="container-x py-20">
        <div className="mb-10 text-center">
          <span className="eyebrow mb-4">Testimonials</span>
          <h2 className="section-title">Trusted by Thousands</h2>
          <p className="mt-2 text-mutedfg">Hear from our customers across Tamil Nadu</p>
        </div>
        <TestimonialsCarousel items={carousel} />
      </section>

      {/* ── CTA cards ────────────────────────────────────────── */}
      <section className="container-x pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ctaCards.map((c) => (
            <Link key={c.title} href={c.href} className="group card-soft flex items-center justify-between transition hover:border-brand/30 hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-pale text-brand"><c.icon size={20} /></span>
                <div>
                  <div className="font-bold text-ink">{c.title}</div>
                  <div className="text-xs text-mutedfg">{c.sub}</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-brand transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Partners ─────────────────────────────────────────── */}
      {partnerList.length > 0 && (
        <section className="border-y border-line bg-white py-14">
          <div className="container-x">
            <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-mutedfg/70">Our technology partners</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {partnerList.map((pt) =>
                pt.logo ? (
                  <Image key={pt.id} src={pt.logo} alt={pt.name} width={140} height={36} unoptimized className="h-9 w-auto max-w-[140px] object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" />
                ) : (
                  <span key={pt.id} className="text-lg font-bold text-mutedfg/60">{pt.name}</span>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="container-x py-20">
        <div className="overflow-hidden rounded-[32px] bg-ink px-8 py-16 text-center text-white">
          <ShieldCheck className="mx-auto mb-4 text-brand-light" size={36} />
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to Switch to Smarter Fuel?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Join thousands of drivers saving {savingsPct}% on fuel costs with cleaner, greener Auto LPG.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/stations" className="btn-primary">Find a Station Near You <ArrowRight size={16} /></Link>
            <Link href="/learn#calculators" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
              Calculate Your Savings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
