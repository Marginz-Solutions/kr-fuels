import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { getContact, getStations, getSiteSettings, getFuelPrices, getCalculatorSettings } from "@/lib/api";
import { BRAND, SITE_URL, STATION_COUNT_FALLBACK, formatAddress } from "@/lib/site";

const TITLE = "K.R Trans Fuels — Tamil Nadu's Largest Auto LPG Network";

// SEO copy is generated from live DB data so the station count + savings figure
// in search results / social cards always match what the site renders. Both
// reads are deduped against the same fetches in RootLayout (React request memo).
export async function generateMetadata(): Promise<Metadata> {
  const [stations, prices] = await Promise.all([getStations(), getFuelPrices()]);
  const count = stations.total > 0 ? stations.total : STATION_COUNT_FALLBACK;
  const savingsPct =
    prices.petrol > 0 && prices.autoLPG > 0
      ? Math.round((1 - prices.autoLPG / prices.petrol) * 100)
      : 40;

  const description = `Switch to Auto LPG and save ${savingsPct}%. ${count}+ stations across Tamil Nadu. Cleaner fuel. Real savings every day.`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: TITLE, template: "%s | KR Trans Fuels" },
    description,
    keywords: ["Auto LPG", "LPG stations Tamil Nadu", "fuel savings", "conversion kits", "KR Trans Fuels"],
    openGraph: {
      title: TITLE,
      description,
      type: "website",
      url: SITE_URL,
      siteName: BRAND.name,
      images: [{ url: "/assets/og.jpg", width: 1920, height: 700, alt: "K.R Trans Fuels — Eco-friendly Auto LPG" }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: `Switch to Auto LPG and save ${savingsPct}%. Cleaner fuel. Real savings every day.`,
      images: ["/assets/og.jpg"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [contact, stations, site, prices, calc] = await Promise.all([
    getContact(),
    getStations(),
    getSiteSettings(),
    getFuelPrices(),
    getCalculatorSettings(),
  ]);

  const hqCity = contact.essentials?.hqCity || BRAND.hqCity;
  const email = contact.essentials?.emails?.info || BRAND.email;
  const phone = contact.essentials?.phoneNos?.office || BRAND.phone;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: contact.essentials?.companyName || BRAND.name,
    description: contact.essentials?.tagline || BRAND.tagline,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: formatAddress(contact.presents?.address),
      addressLocality: hqCity,
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    url: SITE_URL,
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>
        <ScrollToTop />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Header stationCount={stations.total} hqCity={hqCity} email={email} phone={phone} prices={prices} calc={calc} />
        <main>{children}</main>
        <Footer contact={contact} site={site} />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
