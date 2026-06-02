import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContact, getStations, getSiteSettings, getFuelPrices, getCalculatorSettings } from "@/lib/api";
import { BRAND, SITE_URL, formatAddress } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "K.R Trans Fuels — Tamil Nadu's Largest Auto LPG Network",
    template: "%s | KR Trans Fuels",
  },
  description:
    "Switch to Auto LPG and save 40%. 81+ stations across Tamil Nadu. Cleaner fuel. Real savings every day.",
  keywords: ["Auto LPG", "LPG stations Tamil Nadu", "fuel savings", "conversion kits", "KR Trans Fuels"],
  openGraph: {
    title: "K.R Trans Fuels — Tamil Nadu's Largest Auto LPG Network",
    description: "Switch to Auto LPG and save 40%. 81+ stations across Tamil Nadu. Cleaner fuel. Real savings every day.",
    type: "website",
    url: SITE_URL,
    siteName: BRAND.name,
    images: [{ url: "/assets/og.jpg", width: 1920, height: 700, alt: "K.R Trans Fuels — Eco-friendly Auto LPG" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "K.R Trans Fuels — Tamil Nadu's Largest Auto LPG Network",
    description: "Switch to Auto LPG and save 40%. Cleaner fuel. Real savings every day.",
    images: ["/assets/og.jpg"],
  },
  robots: { index: true, follow: true },
};

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Header stationCount={stations.total} hqCity={hqCity} email={email} phone={phone} prices={prices} calc={calc} />
        <main>{children}</main>
        <Footer contact={contact} site={site} />
      </body>
    </html>
  );
}
