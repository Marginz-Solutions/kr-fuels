import { api } from "../axiosInstance";
import type { Client } from "@/types";

export interface ClientFilters {
  type?: string;
  active?: string;
  q?: string;
}

export async function fetchClients(filters: ClientFilters = {}): Promise<Client[]> {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.active) params.set("active", filters.active);
  if (filters.q) params.set("q", filters.q);
  const qs = params.toString();
  const data = (await api.get(`/clients${qs ? `?${qs}` : ""}`)) as any;
  return (data.message ?? []) as Client[];
}

export async function createClient(payload: Partial<Client>): Promise<Client> {
  const data = (await api.post("/clients", payload)) as any;
  return data.data;
}

export async function updateClient(id: string, payload: Partial<Client>): Promise<Client> {
  const data = (await api.patch(`/clients/${id}`, payload)) as any;
  return data.data;
}

export async function toggleClient(id: string): Promise<{ id: string; active: boolean }> {
  const data = (await api.patch(`/clients/${id}/toggle`)) as any;
  return data.data;
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients/${id}`);
}
