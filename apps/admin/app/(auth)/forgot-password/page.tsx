"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { auth } from "@/lib/firebase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!email.trim()) return setError("Please enter your email address.");

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            setSent(true);
        } catch (err: any) {
            setError(getFriendlyError(err?.code));
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand">
                    <CheckCircle2 size={24} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-ink">Check your inbox</h1>
                <p className="mx-auto mt-2 max-w-xs text-sm text-mutedfg">
                    If an account exists for <span className="font-medium text-ink">{email}</span>,
                    we&apos;ve sent a link to reset your password.
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
                <h1 className="text-2xl font-bold text-ink">Reset password</h1>
                <p className="mt-1 text-sm text-mutedfg">
                    Enter your email and we&apos;ll send you a reset link.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600"
                >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                        Email
                    </label>
                    <div className="relative">
                        <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mutedfg" />
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@krfuels.com"
                            required
                            disabled={loading}
                            className="w-full rounded-lg border border-line py-2.5 pl-9 pr-3.5 text-sm text-ink transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-60"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Sending…" : "Send reset link"}
                </button>
            </form>

            <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-mutedfg hover:text-ink"
            >
                <ArrowLeft size={15} /> Back to sign in
            </Link>
        </>
    );
}

function getFriendlyError(code: string): string {
    const map: Record<string, string> = {
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-not-found": "If an account exists for this email, a reset link has been sent.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Check your connection and try again.",
    };
    return map[code] ?? "Could not send the reset email. Please try again.";
}
