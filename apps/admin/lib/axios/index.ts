import axios, { AxiosError, AxiosResponse } from "axios";
import { pingRevalidate } from "../revalidate";

// Methods that change data — a successful one should refresh the public site.
const MUTATING = new Set(["post", "put", "patch", "delete"]);

export const api= axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    withCredentials:true
})

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (MUTATING.has((response.config.method ?? "").toLowerCase())) pingRevalidate();
    return response;
  },
  (error: AxiosError<{ error?: string; message?: string; issues?: Record<string, string[]> }>) => {
    const status  = error.response?.status
    const issues  = error.response?.data?.issues
    // Field-level validation errors (e.g. { mobileNumber: ["Invalid mobile number"] })
    // are flattened into the message so a 400 names the offending field instead of a
    // bare "Validation failed". They're also attached to the Error for callers that
    // want to highlight individual inputs.
    const fieldDetail = issues
      ? Object.entries(issues)
          .map(([field, msgs]) => `${field}: ${(msgs ?? []).join(", ")}`)
          .join(" · ")
      : ""
    const baseMessage =
      error.response?.data?.error   ??
      error.response?.data?.message ??
      error.message                 ??
      "Something went wrong"
    const message = fieldDetail ? `${baseMessage} — ${fieldDetail}` : baseMessage
 
    // ── Global status handling ──
    if (status === 401) {
      // Token expired / unauthorized — optionally redirect to login
      // window.location.href = "/login"
      console.warn("[axios] 401 Unauthorized")
    }
 
    if (status === 403) {
      console.warn("[axios] 403 Forbidden")
    }
 
    if (status === 404) {
      console.warn("[axios] 404 Not Found:", error.config?.url)
    }
 
    if (status && status >= 500) {
      console.error("[axios] Server error:", status, error.config?.url)
    }
 
    // Normalize: always reject with a plain Error carrying the server message,
    // exposing the raw field issues for callers that want per-input handling.
    const err = new Error(message)
    if (issues) (err as Error & { issues?: Record<string, string[]> }).issues = issues
    return Promise.reject(err)
  }
)