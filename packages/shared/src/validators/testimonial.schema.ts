import z from "zod";

// Canonical testimonial write contract — the SINGLE source of truth shared by the admin
// create/edit form (TestimonialFormDraft), the backend write routes, and the public read.
// Fields mirror exactly what is persisted in Firestore and read by the website carousel
// (apps/user TestimonialsCarousel) and the admin list (Testimonialcard): name + message are
// required; designation/company/image default to "", rating defaults to 5, isActive to true.
// (Previously this schema used a `review` field that nothing wrote or read — that was stale.)
export const TestimonialSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  designation: z.string().optional().default(""),
  company: z.string().optional().default(""),
  message: z.string().trim().min(1, "Message is required"),
  image: z.string().optional().default(""),
  rating: z.coerce.number().min(1).max(5).optional().default(5),
  isActive: z.boolean().optional().default(true),
});

export const TestimonialPatchSchema = TestimonialSchema.partial();

export type TestimonialInput = z.infer<typeof TestimonialSchema>;
