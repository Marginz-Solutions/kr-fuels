import "server-only"
import { cert,getApp,getApps,initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage";

const adminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    // Replace escaped newlines in env vars
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, 
};

const adminApp = getApps().find(a => a.name === "admin")
  ?? initializeApp(adminConfig, "admin");

const dbId = process.env.FIREBASE_DB ?? "(default)";

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp, dbId);
export const adminStorage = getStorage(adminApp);