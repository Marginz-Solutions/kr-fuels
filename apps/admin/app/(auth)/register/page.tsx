"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { AlertCircle, ArrowLeft, Loader2, ShieldOff } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { setDocument } from "@/lib/firebase/firestore";

// Open self-registration is OFF by default for a public staff admin. Set
// NEXT_PUBLIC_ALLOW_REGISTRATION=true only to bootstrap the first account.
const REGISTRATION_ENABLED = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === "true";

async function createSession(idToken: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("session-failed");
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(user, { displayName: name });
      await setDocument("users", user.uid, {
        name,
        email: email.trim(),
        createdAt: new Date().toISOString(),
        role: "admin",
      });
      const idToken = await user.getIdToken();
      await createSession(idToken);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(getFriendlyError(err?.code ?? err?.message));
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      await setDocument("users", user.uid, {
        name: user.displayName,
        email: user.email,
        createdAt: new Date().toISOString(),
        role: "admin",
      });
      const idToken = await user.getIdToken();
      await createSession(idToken);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(getFriendlyError(err?.code ?? err?.message));
      setLoading(false);
    }
  }

  // ── Guard: registration disabled ───────────────────────────────────────
  if (!REGISTRATION_ENABLED) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fee2e2]">
          <ShieldOff size={24} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-ink">Registration is disabled</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-mutedfg">
          New accounts for the KR Trans Fuels admin panel are created by an
          administrator. Please contact your administrator for access.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Create admin account</h1>
        <p className="mt-1 text-sm text-mutedfg">Bootstrap the first KR Trans Fuels staff account.</p>
      </div>

      {/* <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-white px-4 py-3 text-sm font-bold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-mutedfg">or</span>
        <div className="h-px flex-1 bg-line" />
      </div> */}

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
            disabled={loading}
            className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@krfuels.com"
            required
            disabled={loading}
            className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            disabled={loading}
            className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm text-ink transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mutedfg">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

function getFriendlyError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/operation-not-allowed": "Email/password sign-up is not enabled in Firebase.",
    "session-failed": "Account created, but the session could not be saved. Try signing in.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}
