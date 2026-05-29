import { StationRowSchema } from "@/lib/validators/station.schema";
import z from "zod";

export interface StationAddress {
    doorNo?: string;
    street?: string;
    pincode: string;
}

export interface StationLocation {
    latitude: number;
    longitude: number;
}

export interface Station {
    id?: string;
    district: string;
    area: string;
    stationName: string;
    contactPerson: string;
    mobileNumber: string;
    telephone?: string;
    emailID?: string;
    address: StationAddress;
    status: "active" | "inactive";
    workingHours:string,
    images?:string[],
    location: StationLocation;
    imageCount?:number
}

export type StationRow = z.infer<typeof StationRowSchema>

export interface Testimonial {
    id?: string,
    name: string,
    designation: string,
    review: string,
    imageUrl?: string,
    date: Date,
    createdAt: Date,
    updatedAt: Date,
}

export interface Faq {
    id?: string,
    question: string,
    isLink:boolean
    answer: string,
    createdAt: Date,
    updatedAt: Date
}

export type FirestoreTimestamp = { _seconds: number; _nanoseconds: number };

export interface Feedback {
    id?: string
    name: string
    email: string
    phoneNo: string
    message: string
    category: string
    rating: number
    safetyAwareness: boolean
    stationId: string
    stationName:string,
    status: "pending" | "in-progress" | "resolved"
    createdAt?:  Date | string | FirestoreTimestamp | null
    updatedAt?:  Date | string | FirestoreTimestamp | null
}

export interface Enquiry {
    id?: string,
    name: string,
    email: string,
    message: string,
    createdAt?: Date
}

export interface AdminContactEssentials {
    companyName: string,
    emails: {
        info: string,
        support: string
    },
    phoneNos: {
        office: string,
        whatsapp: string
    },
    tagline: string,
    createdAt: Date,
    updatedAt: Date
}

export interface AdminContactPresents {
    address: {
        city: string,
        pincode: string,
        state: string,
        street: string
    },
    exactLocation: {
        latitude: string,
        longitude: string
    },
    socialLinks: {
        facebook: string,
        instagram: string,
        twitter: string,
        youtube: string
    },
    workingHours: Date
    createdAt: Date,
    updatedAt: Date

}

export interface Pagination {
    total: number,
    limit: number,
    page: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
}

export interface StationResponse {
    data: Station[],
    meta: Pagination,
    stats: {
        active: number,
        districts: string[],
        inactive: number,
        totalDistricts: number
    }
}

export interface FaqResponse{
    data: Faq[],
    meta:Pagination
}

export interface EnquiryResponse{
    data:Enquiry[],
    meta:Pagination
}

export interface FeedbackResponse{
    data: Feedback[],
    meta:Pagination
}
export interface AdminContactResponse{
    essentials:AdminContactEssentials,
    presents:AdminContactPresents
}