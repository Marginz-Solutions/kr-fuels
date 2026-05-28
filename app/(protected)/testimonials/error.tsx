"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Testimonials page error:", error);
  }, [error]);

  return (
    <div className="min-h-full p-4 sm:p-6 bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_0_rgba(0,0,0,0.05)] w-full max-w-md p-8 text-center">

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>

        {/* Heading */}
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Failed to load testimonials
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-1">
          Something went wrong while fetching the data.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-6" />}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}