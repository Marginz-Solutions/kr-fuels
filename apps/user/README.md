# @kr/user — KR Trans Fuels public website

Next.js 16 (App Router, SSR + ISR), Tailwind v4. Rebuild of the Lovable reference
(`https://fueluxe-spark.lovable.app/`) wired to live backend data via the **public**
read endpoints (`/api/v1/public/*`). Runs on **3000**.

## Pages

`/` Home · `/about` · `/products` · `/stations` (+ `/stations/[id]`) · `/learn`
(comparison + calculators + FAQ) · `/contact` · `/privacy`.

## Dynamic data (single source of truth = backend)

Everything below is fetched from the backend with graceful fallbacks (`lib/api.ts`):
fuel prices, stations (+ filters, detail, dynamic "81+" count), testimonials, FAQ,
privacy policy, contact details (header/footer/map), products (+ per-product
`external_url`), partner logos (clients), About content + video, Our Journey,
footer tags, calculator constants, HQ city label. Only pure layout and immutable
brand constants (`lib/site.ts`) are hardcoded.

## Env

`NEXT_PUBLIC_API_BASE_URL` (backend origin + `/api/v1`), `NEXT_PUBLIC_SITE_URL`
(canonical/sitemap), `NEXT_PUBLIC_ADMIN_URL` (Admin Login target). See `.env.example`.

## SEO

Per-page `metadata`, Open Graph, `sitemap.ts`, `robots.ts`, and LocalBusiness JSON-LD
(in `app/layout.tsx`) built from the dynamic contact details.
