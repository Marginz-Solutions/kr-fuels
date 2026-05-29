// lib/server-fetch.ts
import { cookies } from 'next/headers'

export async function serverFetch(path: string, options?: RequestInit) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value  // ✅ matches your verifySession

  if (!session) {
    throw new Error('No session cookie found')
  }

  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
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