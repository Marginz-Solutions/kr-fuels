import type { ComponentType } from "react";
import { Station } from "./dust";

// ─── Domain Models ────────────────────────────────────────

export interface Testimonial {
  id: number;
  name: string;
  designation: string;
  review: string;
  date: string;
  rating: number;
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

export interface ProductCategory {
  icon: string;
  items: string[];
}

export type ProductCatalog = Record<string, ProductCategory>;

// ─── Navigation ───────────────────────────────────────────

export type PageId =
  | "dashboard"
  | "testimonials"
  | "clients"
  | "stations"
  | "products"
  | "faq"
  | "contact"
  | "settings"
  | "profile";

export interface NavItem {
  id: PageId;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
}

// ─── Badge Color ──────────────────────────────────────────

export type BadgeColor = "green" | "amber" | "red" | "blue";

// ─── Form Drafts ──────────────────────────────────────────

export type TestimonialFormDraft = Pick<Testimonial, "name" | "designation" | "review">;

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
  emailID: string;
  mapLink: string;
  images: string[];
};

export type FAQFormDraft = Pick<FAQ, "question" | "answer" | "isLink">;
