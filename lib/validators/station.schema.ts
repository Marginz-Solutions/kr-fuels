import {z} from "zod"

const StationAddressSchema = z.object({
    doorNo: z.string().min(1,"Door no is required"),
    street: z.string().min(1,"Street is required"),
    pincode: z.number().int().min(100000).max(999999, "Invalid pincode"),
})

const StationLocationSchema = z.object({
  latitude:  z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const StationSchema = z.object({
  district:      z.string().min(1, "District is required"),
  area:          z.string().min(1, "Area is required"),
  stationName:   z.string().min(2, "Station name is required"),
  contactPerson: z.string().min(2, "Contact person is required"),
  mobileNumber:  z.string().regex(/^\+91\s\d{5}\s\d{5}$/, "Invalid mobile number"),
  telephone:     z.string().optional().default(""),
  emailID:       z.string().email("Invalid email").optional().or(z.literal("")),
  address:       StationAddressSchema,
  location:      StationLocationSchema,
});

export const StationPatchSchema = z.object({
  district:      z.string().min(1).optional(),
  area:          z.string().min(1).optional(),
  stationName:   z.string().min(2).optional(),
  contactPerson: z.string().min(2).optional(),
  mobileNumber:  z.string().regex(/^\+91\s\d{5}\s\d{5}$/).optional(),
  telephone:     z.string().optional(),
  emailID:       z.string().email().optional().or(z.literal("")),
  address:       StationAddressSchema.partial().optional(), 
  location:      StationLocationSchema.partial().optional(), 
});

export const StationRowSchema = z.object({
  district: z.string().min(1, "district is required"),
  area: z.string().min(1, "area is required"),
  stationName: z.string().min(1, "stationName is required"),
  contactPerson: z.string().min(1, "contactPerson is required"),
  mobileNumber: z.string().min(1, "mobileNumber is required"),
  telephone: z.string().optional().default(""),
  emailID: z.string().email("invalid emailID").optional().or(z.literal("")).default(""),
  doorNo: z.string().optional().default(""),
  street: z.string().optional().default(""),
  pincode: z.coerce.number({ error: "pincode must be a number" }),
  latitude: z.coerce.number({ error: "latitude must be a number" }),
  longitude: z.coerce.number({ error: "longitude must be a number" }),
});

export const ExcelUploadStationSchema = z.array(StationRowSchema).min(1,"Excel file has no data rows")

