import type { Metadata } from "next";
import Image from "next/image";
import { C } from "@/constants/colors";

export const metadata: Metadata = {
  title: "Staff Login | KR Trans Fuels Admin",
  description: "Sign in to the K.R Trans Fuels Private Limited admin panel.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{ background: C.bg }}
    >
      {/* Soft brand background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: C.p }}
        />
        <div
          className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full opacity-15 blur-3xl"
          style={{ background: C.p }}
        />
      </div>

      <div className="w-full max-w-md">
        {/* Brand lockup */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3">
            <Image src="/assets/logo.png" alt="KR Trans Fuels" width={96} height={76} className="h-14 w-auto" priority />
          </div>
          <div className="text-lg font-extrabold leading-tight" style={{ color: C.t }}>
            K.R Trans Fuels
          </div>
          <div className="text-xs font-medium" style={{ color: C.tm }}>
            Private Limited · Admin Panel
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl bg-white p-8 shadow-[0_2px_18px_rgba(26,46,41,0.05)]"
          style={{ border: `1px solid ${C.bd}` }}
        >
          {children}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: C.tm }}>
          © {new Date().getFullYear()} K.R Trans Fuels Private Limited. All rights reserved.
        </p>
      </div>
    </div>
  );
}
