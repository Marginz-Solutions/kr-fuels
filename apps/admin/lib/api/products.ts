import { Product, ProductFormDraft, ProductCategory } from "@/types";
import { api } from "../axiosInstance";

// ─── Fetch all ────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const data = await api.get("/products") as any;
  return data.message;
}

// ─── Fetch single ─────────────────────────────────────────────────────────────

export async function fetchProduct(id: string): Promise<Product> {
  const data = await api.get(`/products/${id}`) as any;
  return data.data;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProduct(form: ProductFormDraft): Promise<Product> {
  const data = await api.post("/products", form) as any;
  return data.data;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProduct(id: string, form: ProductFormDraft): Promise<Product> {
  const data = await api.put(`/products/${id}`, form) as any;
  return data.data;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

// ─── Toggle is_active ─────────────────────────────────────────────────────────

export async function toggleProduct(id: string): Promise<{ id: string; is_active: boolean }> {
  const data = await api.patch(`/products/${id}/toggle`) as any;
  return data.data;
}

// ─── Upload image ─────────────────────────────────────────────────────────────

export async function uploadProductImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const data = await api.post("/products/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  }) as any;

  return data.url;
}

// ─── Fetch categories ─────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<ProductCategory[]> {
  const data = await api.get("/products/categories") as any;
  return data.data;
}

// ─── Create category ──────────────────────────────────────────────────────────

export async function createCategory(name: string, icon_label: string): Promise<ProductCategory> {
  const data = await api.post("/products/categories", { name, icon_label }) as any;
  return data.data;
}