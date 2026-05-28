import { LayoutGrid } from "lucide-react";

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

const SidebarItemSkeleton = () => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 animate-pulse">
    <div className="w-7 h-7 rounded-lg bg-gray-100 shrink-0" />
    <div className="flex-1 h-3 bg-gray-100 rounded-full" />
    <div className="w-6 h-4 bg-gray-100 rounded-full" />
  </div>
);

const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    {/* Image area */}
    <div className="h-36 bg-gray-100" />
    {/* Content */}
    <div className="p-4 space-y-3">
      <div className="h-3.5 bg-gray-100 rounded-full w-2/3" />
      <div className="h-2.5 bg-gray-100 rounded-full w-full" />
      <div className="h-2.5 bg-gray-100 rounded-full w-4/5" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 bg-gray-100 rounded-lg w-16" />
      </div>
      <div className="h-2 bg-gray-100 rounded-full w-1/3" />
    </div>
    {/* Action bar */}
    <div className="flex items-center border-t border-gray-100 px-3 py-2.5 gap-1">
      <div className="flex-1 h-7 bg-gray-50 rounded-lg" />
      <div className="w-px h-4 bg-gray-100" />
      <div className="flex-1 h-7 bg-gray-50 rounded-lg" />
      <div className="w-px h-4 bg-gray-100" />
      <div className="flex-1 h-7 bg-gray-50 rounded-lg" />
      <div className="w-px h-4 bg-gray-100" />
      <div className="w-8 h-7 bg-gray-50 rounded-lg" />
    </div>
  </div>
);

// ─── Loading ──────────────────────────────────────────────────────────────────

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar skeleton — hidden on mobile */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen">
          {/* Header */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <LayoutGrid className="w-4 h-4 text-teal-700" />
            <span className="text-sm font-bold text-gray-900">Categories</span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-3 px-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SidebarItemSkeleton key={i} />
            ))}
          </nav>

          {/* Add category button skeleton */}
          <div className="p-3 border-t border-gray-100">
            <div className="h-9 rounded-xl border border-dashed border-gray-200 bg-gray-50 animate-pulse" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:pl-6">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-5 w-36 bg-gray-200 rounded-full" />
              <div className="h-3 w-48 bg-gray-100 rounded-full" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-xl" />
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3.5 mb-5 animate-pulse">
            <div className="flex gap-3">
              <div className="flex-1 h-9 bg-gray-100 rounded-xl" />
              <div className="h-9 w-36 bg-gray-100 rounded-xl" />
            </div>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}