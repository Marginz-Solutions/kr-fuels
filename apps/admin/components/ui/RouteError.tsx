"use client";
import { useEffect } from "react";
import { AlertOctagon, RefreshCcw } from "lucide-react";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Shown as the heading, e.g. "Failed to load Products". */
  title?: string;
  /** Optional supporting line under the heading. */
  description?: string;
}

/**
 * Shared styled error boundary for (protected) routes. Drop into any
 * `error.tsx`: `export default function Error(p){ return <RouteError {...p} title="…" /> }`.
 */
export default function RouteError({
  error,
  reset,
  title = "Something went wrong",
  description = "There was a problem loading this page. This might be due to a network interruption or a temporary service issue.",
}: RouteErrorProps) {
  useEffect(() => {
    console.error(`${title}:`, error);
  }, [error, title]);

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[70vh] text-center w-full">
      <div className="bg-white rounded-2xl border border-line shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-8 max-w-md w-full flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertOctagon size={36} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-ink m-0">{title}</h2>
          <p className="text-xs text-mutedfg mt-2 leading-relaxed">{description}</p>
        </div>

        {error?.message && (
          <div className="bg-red-50 text-red-700 text-xs font-mono p-3 rounded-lg w-full text-left overflow-auto max-h-24 border border-red-100">
            {error.message}
          </div>
        )}

        <button
          onClick={() => reset()}
          className="bg-brand text-white border-none rounded-[10px] py-2.5 px-5 cursor-pointer font-medium text-sm flex items-center gap-2 transition-opacity duration-150 whitespace-nowrap hover:opacity-90 shadow-sm"
        >
          <RefreshCcw size={16} /> Try Again
        </button>
      </div>
    </div>
  );
}
