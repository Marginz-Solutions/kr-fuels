// lib/api/testimonials.ts

import { Testimonial, TestimonialFormDraft } from "@/types";
import { api } from "@/lib/axiosInstance";

// ─── Fetch all ────────────────────────────────────────────────────────────────

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const data = await api.get("/testimonials") as any;
  return data.message;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createTestimonial(form: TestimonialFormDraft): Promise<Testimonial> {
  const data = await api.post("/testimonials", form) as any;
  return data.data;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateTestimonial(id: string, form: TestimonialFormDraft): Promise<Testimonial> {
  const data = await api.put(`/testimonials/${id}`, form) as any;
  return data.data;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteTestimonial(id: string): Promise<void> {
  await api.delete(`/testimonials/${id}`);
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export async function toggleTestimonial(id: string): Promise<{ id: string; isActive: boolean }> {
  const data = await api.patch(`/testimonials/${id}/toggle`) as any;
  return data.data;
}

// ─── Upload image ─────────────────────────────────────────────────────────────

export async function uploadTestimonialImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const data = await api.post("/testimonials/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  }) as any;

  return data.url;
}