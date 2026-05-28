import z from "zod"

export const AdminContactEssentialsSchema = z.object({
    companyName: z.string().min(2, "Company name must be at least 2 characters"),

    emails: z.object({
        info:    z.string().email("Invalid info email"),
        support: z.string().email("Invalid support email"),
    }),

    phoneNos: z.object({
        office:   z.string().regex(/^[+]?[0-9]{10,15}$/, "Invalid office phone number"),
        whatsapp: z.string().regex(/^[+]?[0-9]{10,15}$/, "Invalid whatsapp number"),
    }),

    tagline: z.string().min(5, "Tagline must be at least 5 characters").max(200),
})

export const AdminContactEssentialsPatchSchema = z.object({
    companyName: z.string().min(2).optional(),

    emails: z.object({
        info:    z.string().email().optional(),
        support: z.string().email().optional(),
    }).optional(),

    phoneNos: z.object({
        office:   z.string().regex(/^[+]?[0-9]{10,15}$/).optional(),
        whatsapp: z.string().regex(/^[+]?[0-9]{10,15}$/).optional(),
    }).optional(),

    tagline: z.string().min(5).max(200).optional(),
})


export type AdminContactEssentialsInput      = z.infer<typeof AdminContactEssentialsSchema>
export type AdminContactEssentialsPatchInput = z.infer<typeof AdminContactEssentialsPatchSchema>


export const AdminContactPresentsSchema = z.object({
    address: z.object({
        city:    z.string().min(2, "City is required"),
        pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
        state:   z.string().min(2, "State is required"),
        street:  z.string().min(5, "Street is required"),
    }),

    exactLocation: z.object({
        lat: z.string().regex(/^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/, "Invalid latitude"),
        lng: z.string().regex(/^-?(1[0-7][0-9](\.[0-9]+)?|[1-9]?[0-9](\.[0-9]+)?|180(\.0+)?)$/, "Invalid longitude"),
    }),

    socialLinks: z.object({
        facebook:  z.string().url("Invalid Facebook URL").or(z.literal("")),
        instagram: z.string().url("Invalid Instagram URL").or(z.literal("")),
        twitter:   z.string().url("Invalid Twitter URL").or(z.literal("")),
        youtube:   z.string().url("Invalid YouTube URL").or(z.literal("")),
    }),

    workingHours: z.string().min(2, "Working hours is required"),
})

export const AdminContactPresentsPatchSchema = z.object({
    address: z.object({
        city:    z.string().min(2).optional(),
        pincode: z.string().regex(/^[0-9]{6}$/).optional(),
        state:   z.string().min(2).optional(),
        street:  z.string().min(5).optional(),
    }).optional(),

    exactLocation: z.object({
        lat: z.string().regex(/^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/).optional(),
        lng: z.string().regex(/^-?(1[0-7][0-9](\.[0-9]+)?|[1-9]?[0-9](\.[0-9]+)?|180(\.0+)?)$/).optional(),
    }).optional(),

    socialLinks: z.object({
        facebook:  z.string().url().or(z.literal("")).optional(),
        instagram: z.string().url().or(z.literal("")).optional(),
        twitter:   z.string().url().or(z.literal("")).optional(),
        youtube:   z.string().url().or(z.literal("")).optional(),
    }).optional(),

    workingHours: z.string().min(2).optional(),
})

export type AdminContactPresentsInput      = z.infer<typeof AdminContactPresentsSchema>
export type AdminContactPresentsPatchInput = z.infer<typeof AdminContactPresentsPatchSchema>