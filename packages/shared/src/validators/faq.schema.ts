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

// Reorder payload: the FAQ ids in their new display order. `startIndex` is the
// global position of the first id (i.e. the page offset), so order values stay
// consistent across paginated pages.
export const FaqReorderSchema = z.object({
    orderedIds: z.array(z.string().min(1)).min(1, "orderedIds must not be empty"),
    startIndex: z.number().int().min(0).optional(),
})