"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu, X, Calculator, Leaf, ChevronDown, ArrowUpRight, CalendarDays } from "lucide-react";
import { NAV_LINKS, PRODUCT_MENU, ADMIN_LOGIN_URL } from "@/lib/site";
import type { FuelPricesPublic } from "@/lib/api";
import type { CalculatorSettings } from "@kr/shared/types";

// The calculator modals are interaction-only and heavier than the rest of the
// header — load them as deferred client chunks so they stay out of the initial
// JS on every route. (Kept mounted so input state persists across open/close.)
const SavingsModal = dynamic(() => import("./SavingsModal").then((m) => m.SavingsModal), { ssr: false });
const CarbonModal = dynamic(() => import("./CarbonModal").then((m) => m.CarbonModal), { ssr: false });

export function Header({
  stationCount,
  hqCity,
  email,
  phone,
  prices,
  calc,
}: {
  stationCount: number;
  hqCity: string;
  email: string;
  phone: string;
  prices: FuelPricesPublic;
  calc: CalculatorSettings;
}) {
  const [open, setOpen] = useState(false);
  const [savingsOpen, setSavingsOpen] = useState(false);
  const [carbonOpen, setCarbonOpen] = useState(false);
  const [today, setToday] = useState("");
  const pathname = usePathname();
  const count = stationCount > 0 ? stationCount : 81;

  // Render the date only after mount to avoid SSR/CSR hydration drift.
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }));
  }, []);

  const savings = prices.petrol > 0 && prices.autoLPG > 0 ? Math.round((1 - prices.autoLPG / prices.petrol) * 100) : 38;
  const p = (v: number) => (v > 0 ? v : "—");

  const ticker = (
    <span className="inline-flex items-center gap-6 px-6 text-[12.5px] whitespace-nowrap">
      <span className="text-white/75">Today&apos;s Price in {hqCity}:</span>
      <span className="font-semibold text-white">Auto-LPG ₹{p(prices.autoLPG)}/lit</span>
      <span className="text-white/40">·</span>
      <span className="text-amber-200">Petrol ₹{p(prices.petrol)}/lit</span>
      <span className="text-white/40">·</span>
      <span className="text-amber-200">Diesel ₹{p(prices.diesel)}/lit</span>
      <span className="text-white/40">·</span>
      <span className="font-bold text-white">💚 Savings over Petrol: {savings}%</span>
    </span>
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── Top green price-ticker bar (scrolling marquee) ──────── */}
      <div className="bg-brand text-white">
        <div className="container-x grid h-11 grid-cols-3 items-center gap-4 text-[12.5px]">
          <span className="hidden shrink-0 items-center gap-1.5 font-medium md:flex">
            <CalendarDays size={14} className="text-white/90" />
            <span suppressHydrationWarning>{today}</span>
          </span>
          <div className="col-span-3 overflow-hidden md:col-span-1">
            <div className="flex w-max kr-marquee">
              {ticker}
              {ticker}
            </div>
          </div>
          <div className="hidden shrink-0 items-center justify-end gap-4 md:flex">
            <Link href={`mailto:${email}`} className="hidden text-white/85 hover:text-white lg:inline">{email}</Link>
            <Link href={`tel:${phone}`} className="text-white/85 hover:text-white">{phone}</Link>
            <Link href={ADMIN_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-bold text-white transition hover:bg-white/25">
              Staff Login <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main nav ────────────────────────────────────────────── */}
      <div className="border-b border-line bg-white/95 backdrop-blur">
        <div className="container-x flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/logo.png" alt="KR Trans Fuels" width={48} height={38} className="h-[38px] w-auto" priority />
            <span className="leading-tight">
              <span className="block text-[15px] font-extrabold text-ink">K.R Trans Fuels</span>
              <span className="block text-[11px] font-medium tracking-wide text-mutedfg">Private Limited</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              if (l.href === "/products") {
                // Top-level "Products" stays active on any product screen (Auto LPG, Conversion Kit, …).
                const productsActive = PRODUCT_MENU.some((m) => !m.external && m.href === pathname);
                return (
                  <div key={l.href} className="group relative">
                    <Link href={l.href} aria-current={productsActive ? "page" : undefined} className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] font-semibold transition ${productsActive ? "text-brand" : "text-ink/75 hover:text-brand"}`}>
                      Products <ChevronDown size={14} className="transition group-hover:rotate-180" />
                    </Link>
                    <div className="invisible absolute left-0 top-full w-56 translate-y-1 rounded-2xl border border-line bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      {PRODUCT_MENU.map((m) =>
                        m.external ? (
                          <Link key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg px-3 py-2 my-1 text-sm text-ink/75 transition hover:bg-gray-100 hover:text-ink">
                            {m.label} <ArrowUpRight size={13} />
                          </Link>
                        ) : (
                          <Link key={m.label} href={m.href} aria-current={pathname === m.href ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-sm transition ${pathname === m.href ? "bg-brand-pale text-brand" : "text-ink/75 hover:bg-brand-pale hover:text-brand"}`}>{m.label}</Link>
                        )
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <Link key={l.href} href={l.href} className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] font-semibold transition ${active ? "text-brand" : "text-ink/75 hover:text-brand"}`}>
                  {l.label}
                  {l.href === "/stations" && (
                    <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{count}+</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">
            <button onClick={() => setSavingsOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-black" aria-label="Savings Calculator">
              <Calculator size={15} /> Savings Calculator
            </button>
            <button onClick={() => setCarbonOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[13px] font-bold text-ink transition hover:bg-cream" aria-label="Carbon Footprint">
              <Leaf size={15} className="text-brand" /> Carbon Footprint
            </button>
          </div>

          <button className="grid h-10 w-10 place-items-center rounded-lg lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-line bg-white lg:hidden">
            <div className="container-x flex flex-col gap-1 py-3">
              {NAV_LINKS.map((l) => {
                if (l.href === "/products") {
                  const productsActive = PRODUCT_MENU.some((m) => !m.external && m.href === pathname);
                  return (
                    <div key={l.href}>
                      <Link href={l.href} aria-current={productsActive ? "page" : undefined} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${productsActive ? "bg-brand-pale text-brand" : "text-ink/80 hover:bg-brand-pale"}`}>
                        Products
                      </Link>
                      <div className="ml-3 flex flex-col gap-0.5 border-l border-line pl-3">
                        {PRODUCT_MENU.map((m) =>
                          m.external ? (
                            <Link key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-ink/70 transition hover:bg-brand-pale hover:text-brand">
                              {m.label} <ArrowUpRight size={13} />
                            </Link>
                          ) : (
                            <Link key={m.label} href={m.href} aria-current={pathname === m.href ? "page" : undefined} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2 text-sm transition ${pathname === m.href ? "bg-brand-pale font-semibold text-brand" : "text-ink/70 hover:bg-brand-pale hover:text-brand"}`}>{m.label}</Link>
                          )
                        )}
                      </div>
                    </div>
                  );
                }
                const active = pathname === l.href;
                return (
                  <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${active ? "bg-brand-pale text-brand" : "text-ink/80 hover:bg-brand-pale"}`}>
                    {l.label}{l.href === "/stations" && ` (${count}+)`}
                  </Link>
                );
              })}
              <button onClick={() => { setSavingsOpen(true); setOpen(false); }} className="mt-1 btn-dark justify-center">Savings Calculator</button>
              <button onClick={() => { setCarbonOpen(true); setOpen(false); }} className="btn-outline justify-center">Carbon Footprint</button>
              <Link href={ADMIN_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="btn-outline justify-center">Admin Login</Link>
            </div>
          </div>
        )}
      </div>

      <SavingsModal open={savingsOpen} onClose={() => setSavingsOpen(false)} prices={prices} settings={calc} />
      <CarbonModal open={carbonOpen} onClose={() => setCarbonOpen(false)} settings={calc} />
    </header>
  );
}
