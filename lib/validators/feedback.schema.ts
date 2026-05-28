import z from "zod"

export const FeedbackSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),

    email: z.string()
        .email("Invalid email address"),

    phoneNo: z.string()
        .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number"),

    message: z.string()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message must be less than 1000 characters"),

    category: z.string()
        .min(2, "Category is required"),

    rating: z.number()
        .int()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),

    safetyAwareness: z.boolean(),

    stationId: z.string()
        .min(1, "Station is required"),

    status: z.enum(["pending", "in-progress", "resolved"]).default("pending"),
})

export const FeedbackPatchSchema = z.object({
    status: z.enum(["pending", "in-progress", "resolved"]).optional(),
    message: z.string().min(10).max(1000).optional(),
    category: z.string().min(2).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    safetyAwareness: z.boolean().optional(),
})

export type FeedbackInput = z.infer<typeof FeedbackSchema>
export type FeedbackPatchInput = z.infer<typeof FeedbackPatchSchema>