import z from "zod";

export const TestimonialSchema= z.object({
    name: z.string().min(2,"Name must be more than 1 characters"),
    designation: z.string().min(2,"Designation must be more than 1 characters"),
    review:z.string().min(10,"Review must be more than 10 characters"),
})

export const TestimonialPatchSchema = z.object({
    name: z.string().min(2,"Name must be more than 1 characters").optional(),
    designation: z.string().min(2,"Designation must be more than 1 characters").optional(),
    review:z.string().min(10,"Review must be more than 10 characters").optional(),
})