import z from "zod";

export const FaqSchema = z.object({
    question: z.string().min(10, "Question must be more than 10 character"),
    answer: z.string().min(2, "Answer must be more than 2 characters"),
    isLink: z.boolean().default(false).optional()
})

export const FaqPatchSchema = z.object({
    question: z.string().min(10, "Question must be more than 10 character").optional(),
    answer: z.string().min(2, "Answer must be more than 2 characters").optional(),
    isLink: z.boolean().default(false).optional()
})