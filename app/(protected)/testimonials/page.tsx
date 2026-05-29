// app/(admin)/testimonials/page.tsx
import TestimonialsPage from "./TestimonialsPage";
import { serverFetch } from "@/lib/server-fetch";

export default async function Page() {
  const res = await serverFetch("/testimonials");

  return (
    <TestimonialsPage
      initialTestimonials={res.message ?? []}
    />
  );
}