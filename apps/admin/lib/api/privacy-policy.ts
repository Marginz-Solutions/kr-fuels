import { api } from "@/lib/axiosInstance";
import { PrivacyPolicy, PrivacyPolicyResponse } from "@/types";

export async function fetchPrivacyPolicy(): Promise<PrivacyPolicy | null> {
  const data = await api.get("/privacy-policy") as PrivacyPolicyResponse;
  return data.message;
}

export async function createPrivacyPolicy(
  form: Omit<PrivacyPolicy, "id" | "publishedAt" | "updatedAt" | "updatedBy">
): Promise<PrivacyPolicy> {
  const data = await api.post("/privacy-policy", form) as any;
  return data.data;
}

export async function updatePrivacyPolicy(
  id: string,
  form: Omit<PrivacyPolicy, "id" | "publishedAt" | "updatedAt" | "updatedBy">
): Promise<PrivacyPolicy> {
  const data = await api.put(`/privacy-policy/${id}`, form) as any;
  return data.data;
}