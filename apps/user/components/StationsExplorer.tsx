"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Navigation, Eye, Search } from "lucide-react";
import type { StationPublic } from "@/lib/api";

const FEATURE_OPTIONS = ["24x7", "Free Water", "Nitrogen Air", "Parking", "Restroom", "Air Filling"];
const PER_PAGE = 9;

function stationFeatures(s: StationPublic): string[] {
  const raw = [...(s.amenities ?? []), ...(s.features ?? [])].map((x) => String(x));
  if (s.workingHours && /24/.test(s.workingHours)) raw.push("24x7");
  return Array.from(new Set(raw));
}

function directionsUrl(s: StationPublic): string {
  if (s.mapLink) return s.mapLink;
  const lat = s.location?.latitude;
  const lng = s.location?.longitude;
  if (lat && lng) return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.stationName ?? ""} ${s.district ?? ""}`)}`;
}

export function StationsExplorer({ stations, districts }: { stations: StationPublic[]; districts: string[] }) {
  const [district, setDistrict] = useState("All");
  const [features, setFeatures] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const toggleFeature = (f: string) =>
    setFeatures((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));

  const filtered = useMemo(() => {
    return stations.filter((s) => {
      if (district !== "All" && s.district !== district) return false;
      if (q && !`${s.stationName} ${s.area} ${s.district}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (features.length) {
        const f = stationFeatures(s).map((x) => x.toLowerCase());
        if (!features.every((sel) => f.some((x) => x.includes(sel.toLowerCase().slice(0, 4))))) return false;
      }
      return true;
    });
  }, [stations, district, q, features]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search stations by name or area…"
            className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...districts].map((d) => (
            <button
              key={d}
              onClick={() => { setDistrict(d); setPage(1); }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                district === d ? "bg-brand text-white" : "bg-brand-pale text-brand hover:bg-brand/15"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {FEATURE_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => { toggleFeature(f); setPage(1); }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                features.includes(f) ? "border-brand bg-brand text-white" : "border-black/10 bg-white text-ink/60 hover:border-brand"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 text-sm text-ink/60">
        Showing <span className="font-semibold text-ink">{filtered.length}</span> of {stations.length} stations
      </div>

      {/* Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => {
          const pincode = s.address?.pincode ? ` - ${s.address.pincode}` : "";
          const line = [s.address?.doorNo, s.address?.street].filter(Boolean).join(", ");
          return (
            <div key={s.id} className="card-soft flex flex-col">
              {/* Thumbnail — first station image, with a graceful placeholder */}
              {s.images && s.images.length > 0 ? (
                <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl">
                  <Image
                    src={s.images[0]}
                    alt={s.stationName ?? "Station"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="mb-3 grid aspect-video w-full place-items-center rounded-xl bg-cream text-brand/30">
                  <MapPin size={36} />
                </div>
              )}
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="font-bold text-ink">{s.stationName}</h3>
                {s.stationCode && <span className="shrink-0 rounded-md bg-cream px-2 py-0.5 text-[11px] font-semibold text-ink/50">{s.stationCode}</span>}
              </div>
              <div className="text-xs font-medium text-brand">{s.district}{s.area ? ` — ${s.area}` : ""}</div>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-ink/60">
                <MapPin size={14} className="mt-0.5 shrink-0" />{line}{pincode}
              </p>
              {s.workingHours && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink/60">
                  <Clock size={14} />{s.workingHours}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stationFeatures(s).slice(0, 4).map((f) => (
                  <span key={f} className="rounded-full bg-lime/30 px-2 py-0.5 text-[11px] font-semibold text-brand-dark">{f}</span>
                ))}
              </div>
              <div className="mt-4 flex gap-2 pt-3">
                <Link href={directionsUrl(s)} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand py-2 text-xs font-semibold text-white hover:bg-brand-dark">
                  <Navigation size={13} /> Directions
                </Link>
                <Link href={`/stations/${s.id}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-brand/30 py-2 text-xs font-semibold text-brand hover:bg-brand-pale">
                  <Eye size={13} /> View
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card-soft mt-4 text-center text-ink/60">No stations match your filters.</div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 w-9 rounded-full text-sm font-semibold transition ${
                current === i + 1 ? "bg-brand text-white" : "border border-black/10 text-ink/60 hover:border-brand"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
