"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Menu, X, Calculator, Leaf, ChevronDown, ArrowUpRight, CalendarDays, Fuel, Shield } from "lucide-react";
import { NAV_LINKS, PRODUCT_MENU, ADMIN_LOGIN_URL, STATION_COUNT_FALLBACK, fmtCount } from "@/lib/site";
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
  const count = stationCount > 0 ? stationCount : STATION_COUNT_FALLBACK;

  // Render the date only after mount to avoid SSR/CSR hydration drift.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }));
  }, []);

  // Re-clicking "Stations" while already on /stations is a soft navigation that
  // doesn't remount the page, so the explorer keeps its current filters. Tell it
  // to clear them so the screen opens fresh, like a refresh would.
  const resetStationFilters = (href: string) => {
    if (href === "/stations" && pathname === "/stations") {
      window.dispatchEvent(new Event("stations:reset"));
    }
  };

  const p = (v: number) => (v > 0 ? v : "—");

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── Top green price bar — Auto-LPG is the hero; Petrol/Diesel sit beside it as comparison. */}
      <div className="bg-brand text-white">
        <div className="container-x flex items-center justify-between gap-4 py-2.5">
          {/* Left: today + city context (md+) */}
          <div className="hidden min-w-0 flex-col md:flex">
            <span className="text-[12px] font-bold text-white/85">Today · {hqCity}</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
              <CalendarDays size={12} className="text-white/80" />
              <span suppressHydrationWarning>{today}</span>
            </span>
          </div>

          {/* Center: prices — Auto-LPG hero card + Petrol/Diesel comparison */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/15 px-3.5 py-1.5 ring-1 ring-white/20">
              <Fuel size={20} className="shrink-0 text-white/90" />
              <div className="leading-none">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">Auto-LPG</div>
                <div className="mt-1 text-[22px] font-extrabold tracking-tight">
                  ₹{p(prices.autoLPG)}<span className="ml-0.5 text-[11px] font-semibold text-white/70">/litre</span>
                </div>
              </div>
            </div>
            <div className="hidden items-center gap-5 sm:flex">
              {[{ l: "Petrol", v: prices.petrol }, { l: "Diesel", v: prices.diesel }].map((f) => (
                <div key={f.l} className="leading-none">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">{f.l}</div>
                  <div className="mt-1 text-lg font-bold text-yellow-400">
                    ₹{p(f.v)}<span className="ml-0.5 text-[11px] font-medium text-white/50">/lit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: privacy + staff login (md+) */}
          <div className="hidden shrink-0 items-center justify-end gap-2.5 md:flex">
            {/* <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm">
              <Leaf size={14} className="text-brand" />
              <span className="text-[13px] font-extrabold leading-none text-brand">Save {savingsPct}%</span>
              <span className="hidden text-[10px] font-semibold leading-none text-brand/75 lg:inline">vs petrol</span>
            </div> */}
            {/* <span className="h-3.5 w-px bg-white/25" aria-hidden /> */}
            <Link href={ADMIN_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-white/25">
              Staff Login <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main nav ────────────────────────────────────────────── */}
      <div className="border-b border-line bg-white/95 backdrop-blur">
        <div className="container-x flex h-18 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/assets/logo.png" alt="KR Trans Fuels" width={48} height={38} className="h-9.5 w-auto" priority />
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
                <Link key={l.href} href={l.href} onClick={() => resetStationFilters(l.href)} className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] font-semibold transition ${active ? "text-brand" : "text-ink/75 hover:text-brand"}`}>
                  {l.label}
                  {l.href === "/stations" && (
                    <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{fmtCount(count)}</span>
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

          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-lg lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
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
                  <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} onClick={() => { setOpen(false); resetStationFilters(l.href); }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${active ? "bg-brand-pale text-brand" : "text-ink/80 hover:bg-brand-pale"}`}>
                    {l.label}{l.href === "/stations" && ` (${fmtCount(count)})`}
                  </Link>
                );
              })}
              <Link href="/privacy" onClick={() => setOpen(false)} className={`flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold ${pathname === "/privacy" ? "bg-brand-pale text-brand" : "text-ink/80 hover:bg-brand-pale"}`}>
                <Shield size={15} /> Privacy Policy
              </Link>
              <button onClick={() => { setSavingsOpen(true); setOpen(false); }} className="mt-1 btn-dark justify-center">Savings Calculator</button>
              <button onClick={() => { setCarbonOpen(true); setOpen(false); }} className="btn-outline justify-center">Carbon Footprint</button>
              <Link href={ADMIN_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="btn-outline justify-center">Admin Login</Link>
            </div>
          </div>
        )}
      </div>

      <SavingsModal open={savingsOpen} onClose={() => setSavingsOpen(false)} prices={prices} settings={calc} />
      <CarbonModal open={carbonOpen} onClose={() => setCarbonOpen(false)} />
    </header>
  );
}
