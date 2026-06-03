import { signOut } from "firebase/auth";
import { auth } from "./firebase/client";

// Full logout: delete the admin's session cookie and clear Firebase client
// auth. Both steps are best-effort so a network blip never traps the user.
export async function logout() {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch {
    /* ignore — still sign out locally */
  }
  try {
    await signOut(auth);
  } catch {
    /* ignore */
  }
}

// Display helpers for the logged-in user chrome.
export function displayName(user: { displayName?: string | null; email?: string | null } | null): string {
  if (!user) return "Staff";
  if (user.displayName?.trim()) return user.displayName.trim();
  if (user.email) return user.email.split("@")[0];
  return "Staff";
}

export function initials(user: { displayName?: string | null; email?: string | null } | null): string {
  const name = user?.displayName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "S";
  }
  const email = user?.email?.trim();
  if (email) return email[0].toUpperCase();
  return "S";
}
