// app/(admin)/testimonials/page.tsx

import { TestimonialsResponse } from "@/types";
import TestimonialsPage from "./TestimonialsPage";
import { fetchServerApi } from "@/hooks/server-fetch";

export default async function Page() {
  const res = await fetchServerApi<TestimonialsResponse>("/api/v1/testimonials");

  return (
    <TestimonialsPage
      initialTestimonials={res.message ?? []}
    />
  );
}