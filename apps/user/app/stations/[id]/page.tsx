import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";
import { MapPin, Clock, Navigation, Phone, User, Mail, ArrowLeft } from "lucide-react";
import { getStation } from "@/lib/api";
import { STATIONS_FALLBACK } from "@/lib/fallbacks";

interface Props {
  params: Promise<{ id: string }>;
}

// ISR: station detail is cacheable; refreshes in the background.
export const revalidate = 60;

// Real backend station wins; otherwise use the fallback set (so demo "View" works).
async function resolveStation(id: string) {
  return (await getStation(id)) ?? STATIONS_FALLBACK.find((x) => x.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = await resolveStation(id);
  return {
    title: s?.stationName ? `${s.stationName} — Auto LPG Station` : "Station",
    description: s ? `Auto LPG station in ${s.district}. Working hours, directions and amenities.` : undefined,
  };
}

export default async function StationDetailPage({ params }: Props) {
  const { id } = await params;
  const s = await resolveStation(id);
  if (!s) notFound();

  const line = [s.address?.doorNo, s.address?.street].filter(Boolean).join(", ");
  const pincode = s.address?.pincode ? ` - ${s.address.pincode}` : "";
  const lat = s.location?.latitude;
  const lng = s.location?.longitude;
  const directions = s.mapLink || (lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.stationName} ${s.district}`)}`);
  const mapQuery = lat && lng ? `${lat},${lng}` : `${s.stationName ?? ""} ${s.district ?? ""}`;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  const features = Array.from(new Set([...(s.amenities ?? []), ...(s.features ?? [])].map(String)));

  return (
    <section className="container-x py-12">
      <Link href="/stations" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={15} /> All stations
      </Link>

      <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {(() => {
            const cover = (s as any).primaryImage || s.images?.[0];
            const subImages = (s.images ?? []).filter((img: string) => img !== cover);
            return cover ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Featured / primary image */}
                <div className="relative col-span-2 aspect-video w-full overflow-hidden rounded-xl">
                  <ImageWithSkeleton src={cover} alt={s.stationName ?? "Station"} fill loading="eager" sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                </div>
                {/* Sub-images gallery */}
                {subImages.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <ImageWithSkeleton src={img} alt={`${s.stationName} ${i + 2}`} fill loading="lazy" sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid aspect-video place-items-center rounded-2xl bg-cream text-ink/30">
                <MapPin size={48} />
              </div>
            );
          })()}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-ink">{s.stationName}</h1>
          <div className="mt-1 font-medium text-brand">{s.district}{s.area ? ` — ${s.area}` : ""}</div>

          <div className="mt-6 space-y-3 text-sm text-ink/70">
            <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand" />{line}{pincode}</p>
            {s.workingHours && <p className="flex items-center gap-2"><Clock size={16} className="text-brand" />{s.workingHours}</p>}
            {s.contactPerson && <p className="flex items-center gap-2"><User size={16} className="text-brand" />{s.contactPerson}</p>}
            {s.mobileNumber && <p className="flex items-center gap-2"><Phone size={16} className="text-brand" />{s.mobileNumber}</p>}
            {s.emailID && <p className="flex items-center gap-2"><Mail size={16} className="text-brand" /><a href={`mailto:${s.emailID}`} className="hover:text-brand">{s.emailID}</a></p>}
          </div>

          {features.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {features.map((f) => (
                <span key={f} className="rounded-full bg-lime/30 px-2.5 py-1 text-xs font-semibold text-brand-dark">{f}</span>
              ))}
            </div>
          )}

          <Link href={directions} target="_blank" rel="noopener noreferrer" className="btn-primary mt-7 w-full">
            <Navigation size={16} /> Get Directions
          </Link>

          {/* Location map — kept tight under the button so there's no gap */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            <iframe
              title={`${s.stationName ?? "Station"} location`}
              src={mapSrc}
              className="block h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
