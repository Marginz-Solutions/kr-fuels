import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-cream">
      <div className="bg-white rounded-2xl border border-line shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-8 max-w-md w-full flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white">
          <Compass size={34} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-ink m-0">404</h1>
          <h2 className="text-base font-bold text-ink mt-2">Page not found</h2>
          <p className="text-xs text-mutedfg mt-2 leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="bg-brand text-white rounded-[10px] py-2.5 px-5 font-medium text-sm flex items-center gap-2 transition-opacity hover:opacity-90 shadow-sm no-underline"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
