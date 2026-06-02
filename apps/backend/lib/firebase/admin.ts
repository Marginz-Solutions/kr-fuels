import "server-only"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

function getAdminApp() {
  return getApps().find(a => a.name === "admin") ?? initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  }, "admin")
}

// Defer initialization to first property access so this module can be imported
// at build time without env vars present (they're RUNTIME-only on App Hosting).
function lazy<T extends object>(init: () => T): T {
  return new Proxy({} as T, {
    get(_, prop) {
      const obj = init()
      const val = (obj as any)[prop]
      return typeof val === "function" ? val.bind(obj) : val
    },
  })
}

export const adminAuth = lazy(() => getAuth(getAdminApp()))
export const adminDb = lazy(() => getFirestore(getAdminApp(), process.env.FIREBASE_DB ?? "(default)"))
export const adminStorage = lazy(() => getStorage(getAdminApp()))
