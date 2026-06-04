// Immutable brand constants + fallbacks (everything dynamic falls back to these).
import { PRODUCT_CATALOG } from "./products";

export const BRAND = {
  name: "K.R Trans Fuels Private Limited",
  shortName: "KR Trans Fuels",
  email: "autolpg@krfuels.com",
  phone: "+91-9585586667",
  phone2: "+91-431-2730267",
  address: "No. 20, Lawson's Road, Cantonment, Tiruchirappalli-620001",
  hqCity: "Tiruchirappalli",
  tagline: "Eco-Friendly Automotive Fuel — Since 2007",
  heroTagline: "Switch to Auto LPG. Save 40%. Drive Cleaner.",
  footerTagline: "Eco-friendly fuel. Proven savings.",
  coords: { lat: 10.805, lng: 78.6856 },
  yearsOfService: new Date().getFullYear() - 2007,
};

// Network-size fallbacks. Every screen reads the REAL station count + district
// list live from the DB (getStations → total / districts); these are only used
// to keep the UI and SEO copy sensible if the public API is momentarily down.
export const STATION_COUNT_FALLBACK = 81;
export const DISTRICT_COUNT_FALLBACK = 11;

// Admin app ORIGIN (no trailing slash). Dev: the admin runs on :3001.
// Production: set NEXT_PUBLIC_ADMIN_URL=https://admin.krfuels.com .
export const ADMIN_URL = (process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001").replace(/\/+$/, "");
// Where the public "Staff Login" links actually point.
export const ADMIN_LOGIN_URL = `https://webmail.krfuels.com/interface/root`;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// The admin writes the contact address as an OBJECT ({ street, city, state, pincode }),
// but the header/footer/contact page render it as a single line. Normalize either an
// address object or a plain string into one display string (falling back to BRAND).
export function formatAddress(addr: unknown, fallback: string = BRAND.address): string {
  if (!addr) return fallback;
  if (typeof addr === "string") return addr.trim() || fallback;
  if (typeof addr === "object") {
    const a = addr as Record<string, unknown>;
    const parts = [a.doorNo, a.street, a.area, a.city, a.state, a.pincode]
      .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
      .map(String);
    return parts.length ? parts.join(", ") : fallback;
  }
  return fallback;
}

// Pull display lat/lng out of whatever shape the admin stored coords in
// (presents.exactLocation is the canonical key; coords/location kept as fallbacks).
export function getCoords(presents: any): { latitude: string | number; longitude: string | number } | null {
  const c = presents?.exactLocation ?? presents?.coords ?? presents?.location;
  if (c && c.latitude && c.longitude) return { latitude: c.latitude, longitude: c.longitude };
  return null;
}

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Stations", href: "/stations" },
  { label: "Guide", href: "/guide" },
  { label: "Contact", href: "/contact" },
];

// Products dropdown / footer menu — Auto LPG & Lubricants open internal screens;
// Conversion Kits & Tanks link out to the manufacturer site (external). Derived
// from the single-source product catalog.
export const PRODUCT_MENU = PRODUCT_CATALOG.map((p) => ({
  label: p.label,
  href: p.href,
  external: !!p.external,
}));

// Shown when the backend has no testimonials yet (matches the Lovable reference,
// with the real customer photos downloaded into /public/assets/testimonials).
export const TESTIMONIAL_FALLBACK = [
  { id: "t1", name: "Mr. Thomas Christy Louis", designation: "Customer", company: "", rating: 5, image: "/assets/testimonials/louis.jpg", message: "Switching to Auto LPG with KR Fuels was the best decision. Real savings every month and the staff is friendly." },
  { id: "t2", name: "Mr. R. Jegan", designation: "MD of Megala Travels", company: "", rating: 5, image: "/assets/testimonials/jagan.jpg", message: "Our entire fleet runs on Auto LPG from KR Fuels. Reliability and savings — the formula simply works." },
  { id: "t3", name: "Mr. T. Murugesan", designation: "Idea Cellular Limited", company: "", rating: 5, image: "/assets/testimonials/murugesan.jpg", message: "Clean stations, transparent pricing, and friendly service. KR Fuels has set a benchmark in Tamil Nadu." },
  { id: "t4", name: "Mr. Kannan", designation: "Proprietor, Meena Auto Mech", company: "", rating: 5, image: "/assets/testimonials/meena.jpg", message: "Conversion was smooth, support has been excellent. I recommend Auto LPG to every customer." },
  { id: "t5", name: "Mr. A. Balaji", designation: "MD of Mint Caterings", company: "", rating: 5, image: "/assets/testimonials/balaji.jpg", message: "We saved nearly 40% on fuel costs. The KR Fuels network covers everywhere we drive." },
];

// Offerings shown on Home + Products fallback.
export const OFFERINGS = [
  { emoji: "⛽", title: "Auto LPG Fuel", desc: "Clean, affordable fuel at every station." },
  { emoji: "🔧", title: "Conversion Kits", desc: "BIS-certified Venturi & Sequential kits." },
  { emoji: "🛡️", title: "Tanks & Multivalves", desc: "Safe, certified storage solutions." },
  { emoji: "🛢️", title: "Lubricants", desc: "Engine lubricants for LPG vehicles." },
];
