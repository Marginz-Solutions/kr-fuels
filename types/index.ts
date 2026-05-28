import type { ComponentType } from "react";

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
  createdAt: number;      // Unix timestamp (ms)
  updatedAt: number;      // Unix timestamp (ms)
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

export interface Station {
  id: number;
  name: string;
  address: string;
  phone: string;
  district: string;
  status: StationStatus;
  hours: string;
  mapLink: string;
  images: number;
}

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

export const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    designation: "Fleet Manager",
    company: "Tamil Nadu Transport Corp.",
    message:
      "KR Fuels has been our go-to fuel partner for over three years. The quality is consistently excellent and delivery is always on time — even during peak hours. Their team is highly professional and responsive.",
    image: "",
    rating: 5,
    isActive: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: "2",
    name: "Priya Suresh",
    designation: "Operations Director",
    company: "Suresh Logistics Pvt. Ltd.",
    message:
      "We switched to KR Fuels after years of inconsistent supply from our previous vendor. The difference is night and day. Transparent billing, on-demand delivery, and exceptional customer service.",
    image: "",
    rating: 5,
    isActive: true,
    createdAt: 1701000000000,
    updatedAt: 1701000000000,
  },
  {
    id: "3",
    name: "Mohammed Farhan",
    designation: "CEO",
    company: "Farhan Constructions",
    message:
      "Reliable fuel supply is critical for our heavy machinery. KR Fuels has never let us down — not even once in two years. I'd recommend them to any construction company in the region.",
    image: "",
    rating: 4,
    isActive: true,
    createdAt: 1702000000000,
    updatedAt: 1702000000000,
  },
  {
    id: "4",
    name: "Anitha Ravi",
    designation: "Purchase Manager",
    company: "Ravi Industries",
    message:
      "Competitive pricing, clean fuel, and zero delays. Our generator uptime has improved significantly since switching to KR Fuels. Highly trustworthy vendor.",
    image: "",
    rating: 5,
    isActive: true,
    createdAt: 1703000000000,
    updatedAt: 1703000000000,
  },
  {
    id: "5",
    name: "Senthil Murugan",
    designation: "Owner",
    company: "Murugan Auto Works",
    message:
      "Small business owner here — KR Fuels treats every customer with the same respect, big or small. Fast service, honest pricing, and great fuel quality. Five stars without any hesitation.",
    image: "",
    rating: 5,
    isActive: true,
    createdAt: 1704000000000,
    updatedAt: 1704000000000,
  },
  {
    id: "6",
    name: "Divya Krishnan",
    designation: "Admin Head",
    company: "Krishnan Hospitals",
    message:
      "Our hospital depends on uninterrupted power. KR Fuels ensures our generator fuel is always topped up without fail. Their emergency response is particularly commendable.",
    image: "",
    rating: 5,
    isActive: false,
    createdAt: 1705000000000,
    updatedAt: 1705000000000,
  },
];

export type StationFormDraft = Pick<Station, "name" | "address" | "phone" | "district" | "hours" | "mapLink">;

export type FAQFormDraft = Pick<FAQ, "question" | "answer" | "isLink">;

export interface TestimonialsResponse {
  success: boolean;
  message: Testimonial[]; // your API returns { success, message: [...] }
}