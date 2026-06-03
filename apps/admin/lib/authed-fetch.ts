import { API_BASE } from "./api-base";
import { pingRevalidate } from "./revalidate";

export async function authedGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export async function authedSend<T = any>(path: string, method: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `Request failed (${res.status})`);
  }
  // authedSend is only used for writes — refresh the public site on success.
  pingRevalidate();
  return res.json();
}
