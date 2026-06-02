// Single source of truth for the backend API base URL on the client.
// e.g. http://localhost:4000/api/v1  (dev)
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
