// app/(protected)/testimonials/loading.tsx
"use client";
const SkeletonBox = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
);

const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {/* Customer */}
    <td className="px-5 py-4 whitespace-nowrap">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-10 h-10 rounded-full flex-shrink-0" />
        <SkeletonBox className="h-3.5 w-28" />
      </div>
    </td>
    {/* Designation / Company */}
    <td className="px-5 py-4 max-w-[160px]">
      <SkeletonBox className="h-3 w-24 mb-1.5" />
      <SkeletonBox className="h-2.5 w-32" />
    </td>
    {/* Message */}
    <td className="px-5 py-4 max-w-[280px]">
      <SkeletonBox className="h-3 w-full mb-1.5" />
      <SkeletonBox className="h-3 w-4/5" />
    </td>
    {/* Rating */}
    <td className="px-5 py-4 whitespace-nowrap">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonBox key={i} className="w-3.5 h-3.5 rounded-sm" />
        ))}
      </div>
    </td>
    {/* Status */}
    <td className="px-5 py-4 whitespace-nowrap">
      <SkeletonBox className="h-5 w-16 rounded-full" />
    </td>
    {/* Updated */}
    <td className="px-5 py-4 whitespace-nowrap">
      <SkeletonBox className="h-3 w-20" />
    </td>
    {/* Actions */}
    <td className="px-5 py-4 whitespace-nowrap">
      <div className="flex items-center gap-1.5">
        <SkeletonBox className="w-8 h-8 rounded-lg" />
        <SkeletonBox className="w-8 h-8 rounded-lg" />
        <SkeletonBox className="w-8 h-8 rounded-lg" />
      </div>
    </td>
  </tr>
);

const SkeletonCard = () => (
  <div className="p-4 space-y-3 border-b border-gray-50">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-12 h-12 rounded-full flex-shrink-0" />
        <div>
          <SkeletonBox className="h-3.5 w-28 mb-1.5" />
          <SkeletonBox className="h-2.5 w-36" />
        </div>
      </div>
      <SkeletonBox className="h-5 w-16 rounded-full" />
    </div>
    <SkeletonBox className="h-3 w-full" />
    <SkeletonBox className="h-3 w-4/5" />
    <SkeletonBox className="h-3 w-3/5" />
    <div className="flex items-center justify-between pt-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonBox key={i} className="w-3.5 h-3.5 rounded-sm" />
        ))}
      </div>
      <div className="flex gap-1">
        <SkeletonBox className="w-8 h-8 rounded-lg" />
        <SkeletonBox className="w-8 h-8 rounded-lg" />
        <SkeletonBox className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  </div>
);

export default function Loading() {
  return (
    <div className="min-h-full p-4 sm:p-6 bg-gray-50">
      {/* Page header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <SkeletonBox className="h-6 w-52 mb-2" />
          <SkeletonBox className="h-3.5 w-32" />
        </div>
        <SkeletonBox className="h-10 w-36 rounded-xl" />
      </div>

      {/* Table card skeleton */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_0_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b border-gray-100">
          <SkeletonBox className="h-10 flex-1 rounded-xl" />
          <SkeletonBox className="h-10 w-40 rounded-xl" />
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Customer", "Designation / Company", "Message", "Rating", "Status", "Last Updated", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60">
          <SkeletonBox className="h-3 w-40" />
        </div>
      </div>
    </div>
  );
}