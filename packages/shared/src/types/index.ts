import type { ComponentType } from "react";
import { Station } from "./dust";

// ─── Domain Models ────────────────────────────────────────

export interface Testimonial {
  id: string;
  name: string;
  designation?: string;
  company?: string;
  message: string;
  image?: string;
  rating?: number;        // 1–5
  isActive: boolean;
  createdAt?: Date;      // Unix timestamp (ms)
  updatedAt?: Date;      // Unix timestamp (ms)
}


export type ClientType = "client" | "collaborator";

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  website?: string;
  logo?: string; // uploaded image URL or emoji/text fallback
  active: boolean;
  order?: number;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export type StationStatus = "active" | "inactive";


export interface FAQ {
  id: number;
  question: string;
  answer: string;
  isLink: boolean;
}

export type SubmissionStatus = "pending" | "resolved" | "in_progress";

export interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status: SubmissionStatus;
}

export interface FuelPrices {
  diesel: number;
  petrol: number;
  autoLPG: number;
  verified?: string;
}

// ─── Chart / Analytics ────────────────────────────────────

export interface ChartDataPoint {
  month: string;
  stations: number;
  testimonials: number;
  inquiries: number;
}

export interface DistrictDataPoint {
  district: string;
  count: number;
}

// ─── Products ─────────────────────────────────────────────

export interface ProductSection {
  heading: string;
  items: string[];
}

export interface ProductSpec {
  name: string;
  detail: string;
}

export interface ProductDocument {
  id: string;
  product_name: string;
  product_category: string;
  description: string;
  product_image: string;
  gallery_images: string[];
  is_active: boolean;
  external_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  product_name: string;
  product_category: string;
  tagline: string;
  description: string;
  product_image: string;
  gallery_images: string[];
  sections: ProductSection[];
  specs: ProductSpec[];
  slug: string;
  cta_primary_text: string;
  cta_primary_href: string;
  cta_secondary_text: string;
  cta_secondary_href: string;
  is_active: boolean;
  is_external: boolean;
  external_url?: string;
  created_at: number;
  updated_at: number;
}

export interface ProductFormDraft {
  product_name: string;
  product_category: string;
  tagline: string;
  description: string;
  product_image: string;
  gallery_images: string[];
  sections: ProductSection[];
  specs: ProductSpec[];
  slug: string;
  cta_primary_text: string;
  cta_primary_href: string;
  cta_secondary_text: string;
  cta_secondary_href: string;
  is_active: boolean;
  is_external: boolean;
  external_url?: string;
}

export const PRODUCT_EMPTY_DRAFT: ProductFormDraft = {
  product_name: "",
  product_category: "",
  tagline: "",
  description: "",
  product_image: "",
  gallery_images: [],
  sections: [],
  specs: [],
  slug: "",
  cta_primary_text: "Find a station",
  cta_primary_href: "/stations",
  cta_secondary_text: "Talk to our team",
  cta_secondary_href: "/contact",
  is_active: true,
  is_external: false,
  external_url: "",
};

export interface ProductCategory {
  id: string;
  name: string;
  icon_label: string;
  created_at: string;
  updated_at: string;
}

export type ProductCatalog = Record<string, ProductCategory>;


// Shape of GET /api/v1/products response
export interface ProductsResponse {
  success: boolean;
  message: Product[];   // your API returns { success, message: [...] }
}

// Shape of GET /api/v1/products/categories response
export interface CategoriesResponse {
  success: boolean;
  data: ProductCategory[];
}

// ─── Navigation ───────────────────────────────────────────

export type PageId =
  | "dashboard"
  | "testimonials"
  | "clients"
  | "stations"
  | "faq"
  | "contact"
  | "seo-settings"
  | "profile";

export interface NavItem {
  id: PageId;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
}

// ─── Badge Color ──────────────────────────────────────────

export type BadgeColor = "green" | "amber" | "red" | "blue";

export interface TestimonialFormDraft {
  name: string;
  designation: string;
  company: string;
  message: string;
  image?: string;
  rating: number | "";    // "" when user clears the field
  isActive: boolean;
}

export const EMPTY_DRAFT: TestimonialFormDraft = {
  name: "",
  designation: "",
  company: "",
  message: "",
  image: "",
  rating: 5,
  isActive: true,
};

export type StationFormDraft = Pick<Station,
  "id"
  | "stationName"
  | "area"
  | "address"
  | "district"
  | "contactPerson"
  | "mobileNumber"
  | "workingHours"
  | "location"
> & {
  telephone: string;
  status: "active" | "inactive"
  emailID: string;
  mapLink: string;
  images: string[];
  primaryImage: string;
  // Mirrors Station.timingDisabled. The Add/Edit form toggles this; when true the
  // working-hours picker is hidden and workingHours is saved empty.
  timingDisabled: boolean;
};

export type FAQFormDraft = Pick<FAQ, "question" | "answer" | "isLink">;

export interface TestimonialsResponse {
  success: boolean;
  message: Testimonial[]; // your API returns { success, message: [...] }
}

export interface DashboardData {
  stations: {
    total: number;
    active: number;
    inactive: number;
  };
  feedback: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    avgRating: number | string;
    safetyAwarenessPercent: number | string;
    resolutionRate: number | string;
    byCategory: Array<{ name: string; count: number }> | Record<string, number>;
    byStation?: Array<{
      stationId: string;
      stationName: string;
      avgRating: number;
      totalFeedbacks: number;
      categoryRatings: Record<string, number>;
    }>;
  };
  enquiries: {
    total?: number;
    new?: number;
    thisMonth: number;
  };
  products: {
    total: number;
    active?: number;
    categories: number;
    byCategory?: Record<string, number>;
  };
  recentFeedback: any[];
  recentEnquiries: any[];
}


export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export interface SeoSettings {
  id: string;

  metaTitle: string;

  metaDescription: string;

  keywords: string[];

  ogImage: string;

  createdAt: Date;

  updatedAt: Date;
}

export interface SeoSettingsResponse {
  success: boolean;

  message: SeoSettings | null;
}

export interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string;
}

export interface PrivacyPolicyBanner {
  title: string;
  subtitle: string;
}

export interface PrivacyPolicy {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  banner: PrivacyPolicyBanner;
  sections: PrivacyPolicySection[];
  publishedAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export interface PrivacyPolicyResponse {
  success: boolean;
  message: PrivacyPolicy | null;
}

// ─── 5.9 dynamic content surfaces ─────────────────────────

export interface AboutContentBlock {
  heading: string;
  body: string;
}

export interface AboutContent {
  videoUrl?: string;
  contentBlocks: AboutContentBlock[];
  showStationCount?: boolean;
  updatedAt?: string | Date | null;
}

export const ABOUT_CONTENT_DEFAULT: AboutContent = {
  videoUrl: "",
  showStationCount: true,
  contentBlocks: [
    {
      heading: "Powering Green Mobility Since 2007",
      body: "K.R Trans Fuels Private Limited is a pioneer in Auto LPG distribution across Tamil Nadu, helping motorists switch to a cleaner, cheaper, and greener fuel.",
    },
    {
      heading: "Our Mission",
      body: "To make eco-friendly Auto LPG accessible to every motorist while delivering proven savings and reliable service.",
    },
  ],
};

export interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
  order?: number;
}

export interface HeroImage {
  id: string;
  url: string;
  order: number;
  active: boolean;
  createdAt?: string | null;
  createdBy?: string;
}

export interface SiteSocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface SiteSettings {
  footerTags: string[];
  social?: SiteSocialLinks;
  /** MP4/WebM (or YouTube/embed) URL for the "in action" video on the home page. */
  homeVideoUrl?: string;
  updatedAt?: string | Date | null;
}

// The KR GFI Premium Auto LPG TVC hosted on the live site — used as the home-page
// video until an admin sets a different URL.
export const HOME_VIDEO_URL_DEFAULT =
  "https://krfuels.com/assets/videos/KRGFI%20Premium%20Auto%20LPG%20Conversion%20Kit%20%20%20TVC%20%20%20Director's%20Cut.mp4";

export const SITE_SETTINGS_DEFAULT: SiteSettings = {
  footerTags: ["Eco-Friendly", "Auto LPG", "Since 2007", "Proven Savings", "Cleaner Drive"],
  social: {},
  homeVideoUrl: HOME_VIDEO_URL_DEFAULT,
};

export interface CalculatorSettings {
  lpgMileageFactor: number; // LPG mileage ≈ factor × petrol mileage (Savings calculator)
  updatedAt?: string | Date | null;
}

export const CALCULATOR_SETTINGS_DEFAULT: CalculatorSettings = {
  lpgMileageFactor: 0.9,
};