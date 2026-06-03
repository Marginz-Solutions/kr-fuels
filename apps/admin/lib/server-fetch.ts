// lib/server-fetch.ts
import { cookies } from 'next/headers'

// Server components hit the backend directly with its ABSOLUTE base. The public
// NEXT_PUBLIC_API_BASE_URL is now a relative same-origin path (proxied to the
// backend for the browser), which a server-side fetch cannot resolve.
const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? 'http://localhost:4000/api/v1'

export async function serverFetch(path: string, options?: RequestInit) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value  // ✅ matches your verifySession

  if (!session) {
    throw new Error('No session cookie found')
  }

  const res = await fetch(`${BACKEND_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `session=${session}`,  // ✅ forwards exactly what verifySession reads
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`${res.status}: ${path}`)
  }

  return res.json()
}