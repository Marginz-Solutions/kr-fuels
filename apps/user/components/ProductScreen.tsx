import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Fuel,
  Wrench,
  Droplets,
  Cylinder,
  type LucideIcon,
} from "lucide-react";
import { getProducts } from "@/lib/api";
import { normalizeUrl } from "@kr/shared/lib/utils";
import { getProductDetail, productSlug, type ProductIcon } from "@/lib/products";

const ICONS: Record<ProductIcon, LucideIcon> = {
  fuel: Fuel,
  wrench: Wrench,
  droplets: Droplets,
  cylinder: Cylinder,
};

// Merge the editable backend record (dynamic-first) over our faithful catalog content.
async function resolve(slug: string) {
  const detail = getProductDetail(slug);
  if (!detail) return null;
  const { data } = await getProducts();
  const record = data.find((p) => productSlug(p) === slug) ?? null;
  return {
    detail,
    name: record?.product_name?.trim() || detail.label,
    category: record?.product_category?.trim() || detail.category,
    intro: record?.description?.trim() || detail.intro,
    image: record?.product_image?.trim() || detail.image || "",
    gallery: (record?.gallery_images ?? []).filter(Boolean),
    externalUrl: normalizeUrl(record?.external_url) || detail.externalUrl || "",
  };
}

// Shared metadata builder for each product page.
export async function productMetadata(slug: string): Promise<Metadata> {
  const r = await resolve(slug);
  if (!r) return { title: "Products" };
  return {
    title: `${r.name} — K.R Trans Fuels`,
    description: r.intro.slice(0, 160),
  };
}

// Server component rendering a single product screen, shared by every product route.
export default async function ProductScreen({ slug }: { slug: string }) {
  const r = await resolve(slug);
  if (!r) notFound();
  const { detail, name, category, intro, image, gallery, externalUrl } = r;
  const Icon = ICONS[detail.icon];

  return (
    <>
      {/* ── Hero with product selector ───────────────────────────── */}
      <section className="bg-gradient-to-b from-brand-pale/60 to-white">
        <div className="container-x py-12 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="eyebrow mb-4">{category}</span>
              <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">{name}</h1>
              <p className="mt-4 max-w-xl text-lg text-mutedfg">{detail.tagline}</p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink/70">{intro}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/stations" className="btn-primary">
                  Find a station <ArrowRight size={16} />
                </Link>
                <Link href="/contact" className="btn-outline">Talk to our team</Link>
              </div>
            </div>

            <div>
              {image ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line shadow-[0_2px_18px_rgba(13,26,16,0.05)]">
                  <Image src={image} alt={name} fill loading="eager" sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                </div>
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center rounded-2xl border border-line bg-white shadow-[0_2px_18px_rgba(13,26,16,0.05)]">
                  <Icon size={96} className="text-brand/30" strokeWidth={1.25} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Content sections ─────────────────────────────────────── */}
      <section className="container-x py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {detail.sections.map((s) => (
            <div key={s.heading} className="card-soft">
              <h2 className="text-lg font-bold text-ink">{s.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink/75">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-pale text-brand">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Specs / variants ───────────────────────────────────── */}
        {detail.specs.length > 0 && (
          <div className="mt-10">
            <h2 className="section-title">Specifications</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-line">
              {detail.specs.map((spec, i) => (
                <div
                  key={spec.name}
                  className={`grid gap-1 px-5 py-4 sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-6 ${i % 2 ? "bg-cream" : "bg-white"}`}
                >
                  <div className="font-semibold text-ink">{spec.name}</div>
                  <div className="text-[15px] text-mutedfg">{spec.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Gallery (dynamic) ──────────────────────────────────── */}
        {gallery.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((img, i) => (
              <div key={i} className="relative aspect-square w-full overflow-hidden rounded-xl border border-line">
                <Image src={img} alt={`${name} ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 200px" className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {externalUrl && (
          <Link href={externalUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
            View manufacturer details <ExternalLink size={14} />
          </Link>
        )}
      </section>
    </>
  );
}
