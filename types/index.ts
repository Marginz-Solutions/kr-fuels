import type { ComponentType } from "react";
import { Station, Feedback, Enquiry } from "./dust";

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


export interface Client {
  id: number;
  name: string;
  website: string;
  logo: string;
  active: boolean;
  order: number;
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

export interface ProductDocument {
  id: string;
  product_name: string;
  product_category: string;
  description: string;
  product_image: string;
  gallery_images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  product_name: string;
  product_category: string;
  description: string;
  product_image: string;
  gallery_images: string[];
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface ProductFormDraft {
  product_name: string;
  product_category: string;
  description: string;
  product_image: string;
  gallery_images: string[];
  is_active: boolean;
}

export const PRODUCT_EMPTY_DRAFT: ProductFormDraft = {
  product_name: "",
  product_category: "",
  description: "",
  product_image: "",
  gallery_images: [],
  is_active: true,
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