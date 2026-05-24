import { StationRowSchema } from "@/lib/validators/station.schema";
import z from "zod";

export interface StationAddress {
    doorNo?: string;
    street?: string;
    pincode: number;
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
    location: StationLocation;
}

export type StationRow = z.infer<typeof StationRowSchema>