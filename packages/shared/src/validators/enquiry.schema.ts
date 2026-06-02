import z from "zod"

export const EnquirySchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters"),

    email: z.string()
        .email("Invalid email address"),

    phone: z.string()
        .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number"),

    message: z.string()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message must be less than 1000 characters")
})

export type EnquiryInput = z.infer<typeof EnquirySchema>