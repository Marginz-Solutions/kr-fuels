"use client";
import React, { useEffect } from "react";
import { AlertOctagon, RefreshCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[70vh] text-center w-full">
      <div className="bg-white rounded-2xl border border-line shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-8 max-w-md w-full flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertOctagon size={36} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-ink m-0">Failed to load Dashboard</h2>
          <p className="text-xs text-mutedfg mt-2 leading-relaxed">
            There was an error retrieving the real-time metrics. This might be due to a network interruption or temporary service issue.
          </p>
        </div>

        {error?.message && (
          <div className="bg-red-50 text-red-700 text-xs font-mono p-3 rounded-lg w-full text-left overflow-auto max-h-24 border border-red-100">
            {error.message}
          </div>
        )}

        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => reset()}
            className="bg-brand text-white border-none rounded-[10px] py-2.5 px-5 cursor-pointer font-medium text-sm flex items-center gap-2 transition-opacity duration-150 whitespace-nowrap hover:opacity-90 shadow-sm"
          >
            <RefreshCcw size={16} /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}