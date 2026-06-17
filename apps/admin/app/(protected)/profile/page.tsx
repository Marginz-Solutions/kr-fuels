"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { sendPasswordResetEmail } from "firebase/auth";
import { CheckCircle2, KeyRound, Loader2, LogOut, Mail, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { logout, displayName, initials } from "@/lib/auth";
import { C } from "@/constants/colors";
import { avatarColor } from "@/lib/avatarColor";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [resetState, setResetState] = useState<"idle" | "sending" | "sent" | "error">("idle");
    const [signingOut, setSigningOut] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={22} className="animate-spin text-brand" />
            </div>
        );
    }

    const name = displayName(user);
    const email = user?.email ?? "—";
    const photo = user?.photoURL ?? "";
    const verified = user?.emailVerified;
    const provider = user?.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email & password";

    async function handleReset() {
        if (!user?.email) return;
        setResetState("sending");
        try {
            await sendPasswordResetEmail(auth, user.email);
            setResetState("sent");
        } catch {
            setResetState("error");
        }
    }

    async function handleLogout() {
        setSigningOut(true);
        await logout();
        router.replace("/login");
    }

    return (
        <section className="mx-auto max-w-2xl p-6">
            <h1 className="text-[20px] font-bold leading-tight text-ink">Profile</h1>
            <p className="text-[13px] text-mutedfg">Your KR Trans Fuels admin account.</p>

            <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-[0_2px_18px_rgba(26,46,41,0.05)]">
                {/* Identity */}
                <div className="flex items-center gap-4">
                    {photo ? (
                        // Auth-provider photo URL (Google/Firebase) → unoptimized, still lazy-loaded.
                        <Image src={photo} alt="" width={64} height={64} unoptimized referrerPolicy="no-referrer" className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
                            style={{ background: avatarColor(name).bg, color: avatarColor(name).fg }}
                        >
                            {initials(user)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="truncate text-lg font-bold text-ink">{name}</div>
                        <div className="flex items-center gap-1.5 text-sm text-mutedfg">
                            <Mail size={14} /> <span className="truncate">{email}</span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <Detail label="Sign-in method" value={provider} />
                    <Detail
                        label="Email verified"
                        value={
                            <span className="inline-flex items-center gap-1.5">
                                {verified ? (
                                    <ShieldCheck size={15} className="text-brand" />
                                ) : null}
                                {verified ? "Verified" : "Not verified"}
                            </span>
                        }
                    />
                    <Detail label="User ID" value={<span className="break-all font-mono text-xs">{user?.uid ?? "—"}</span>} />
                </dl>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={resetState === "sending" || resetState === "sent" || !user?.email}
                        className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {resetState === "sending" ? <Loader2 size={15} className="animate-spin" /> : resetState === "sent" ? <CheckCircle2 size={15} className="text-brand" /> : <KeyRound size={15} />}
                        {resetState === "sent" ? "Reset email sent" : "Send password reset email"}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={signingOut}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                        style={{ background: C.red }}
                    >
                        <LogOut size={15} /> {signingOut ? "Signing out…" : "Logout"}
                    </button>
                </div>

                {resetState === "error" && (
                    <p className="mt-3 text-sm text-red-600">Could not send the reset email. Please try again.</p>
                )}
            </div>
        </section>
    );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-mutedfg">{label}</dt>
            <dd className="mt-0.5 text-sm text-ink">{value}</dd>
        </div>
    );
}
