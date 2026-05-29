import { api } from "@/lib/axiosInstance";

import {
  SeoSettings,
  SeoSettingsResponse,
} from "@/types";

export async function fetchSeoSettings(): Promise<SeoSettings | null> {
  const data =
    await api.get("/api/v1/seo-settings") as SeoSettingsResponse;

  return data.message;
}

export async function createSeoSettings(
  form: Omit<
    SeoSettings,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<SeoSettings> {

  const data =
    await api.post(
      "/api/v1/seo-settings",
      form
    ) as any;

  return data.data;
}

export async function updateSeoSettings(
  id: string,
  form: Omit<
    SeoSettings,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<SeoSettings> {
  const data =
    await api.put(
      `/api/v1/seo-settings/${id}`,
      form
    ) as any;

  return data.data;
}

export async function uploadSeoImage(
  file: File
): Promise<string> {

  const fd = new FormData();

  fd.append("file", file);

  const data = await api.post(
    "/api/v1/seo-settings/upload",
    fd,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  ) as any;

  return data.url;
}

export async function deleteStorageImage(url: string): Promise<void> {
  await api.delete("/api/v1/seo-settings/upload", { data: { url } });
}