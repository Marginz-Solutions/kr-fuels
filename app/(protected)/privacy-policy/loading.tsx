// app/(dashboard)/privacy-policy/loading.tsx

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

const SectionHeaderSkeleton = () => (
  <div className="flex items-start gap-3 mb-5 pb-4 border-b border-gray-100 animate-pulse">
    <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
    <div className="flex-1 space-y-2 pt-0.5">
      <div className="h-3.5 w-2/5 bg-gray-100 rounded-full" />
      <div className="h-2.5 w-3/5 bg-gray-100 rounded-full" />
    </div>
  </div>
);

const TwoColInputsSkeleton = () => (
  <div className="grid grid-cols-2 gap-3.5 animate-pulse">
    {[0, 1].map((i) => (
      <div key={i} className="space-y-2">
        <div className="h-2.5 w-2/5 bg-gray-100 rounded-full" />
        <div className="h-9 w-full bg-gray-100 rounded-lg" />
      </div>
    ))}
  </div>
);

const StatusToggleSkeleton = () => (
  <div className="mt-4 animate-pulse">
    <div className="h-2.5 w-1/5 bg-gray-100 rounded-full mb-2" />
    <div className="flex gap-2">
      <div className="h-8 w-24 bg-gray-200 rounded-lg" />
      <div className="h-8 w-20 bg-gray-100 rounded-lg" />
    </div>
  </div>
);

const SectionRowSkeleton = ({ idx }: { idx: number }) => (
  <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 animate-pulse">
    {/* Header row */}
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-md bg-gray-200 shrink-0" />
      <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
      <div className="flex gap-1 shrink-0">
        <div className="w-7 h-7 bg-gray-100 rounded-md" />
        <div className="w-7 h-7 bg-gray-100 rounded-md" />
        <div className="w-7 h-7 bg-gray-100 rounded-md" />
      </div>
    </div>
    {/* Textarea */}
    <div className={`w-full bg-gray-100 rounded-lg ${idx % 3 === 1 ? "h-20" : "h-16"}`} />
  </div>
);

const StatusCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
    <div className="h-3.5 w-1/2 bg-gray-200 rounded-full mb-4" />
    {/* status row */}
    <div className="flex justify-between items-center mb-3">
      <div className="h-2.5 w-10 bg-gray-100 rounded-full" />
      <div className="h-5 w-20 bg-gray-100 rounded-full" />
    </div>
    {/* slug */}
    <div className="border-t border-gray-100 pt-3 mb-3 space-y-1.5">
      <div className="h-2.5 w-1/4 bg-gray-100 rounded-full" />
      <div className="h-6 w-3/4 bg-gray-100 rounded-md" />
    </div>
    {/* published */}
    <div className="border-t border-gray-100 pt-3 mb-3 space-y-1.5">
      <div className="h-2.5 w-1/3 bg-gray-100 rounded-full" />
      <div className="h-2.5 w-4/5 bg-gray-100 rounded-full" />
    </div>
    {/* updated */}
    <div className="border-t border-gray-100 pt-3 space-y-1.5">
      <div className="h-2.5 w-2/5 bg-gray-100 rounded-full" />
      <div className="h-2.5 w-3/4 bg-gray-100 rounded-full" />
    </div>
  </div>
);

const SummaryCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
    <div className="h-3.5 w-1/3 bg-gray-200 rounded-full mb-4" />
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="h-2.5 w-2/5 bg-gray-100 rounded-full" />
          <div className="h-3 w-8 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

const SectionsNavCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
    <div className="h-3.5 w-1/3 bg-gray-200 rounded-full mb-4" />
    <div className="space-y-2.5">
      {[65, 80, 55, 72, 60, 50].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-100 shrink-0" />
          <div className="h-2.5 bg-gray-100 rounded-full" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  </div>
);

const PageHeaderSkeleton = () => (
  <div className="flex items-center justify-between mb-5 flex-wrap gap-3 animate-pulse">
    <div className="flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded-full" />
        <div className="h-2.5 w-56 bg-gray-100 rounded-full" />
      </div>
    </div>
    <div className="h-9 w-28 bg-gray-200 rounded-xl" />
  </div>
);

// ─── Loading ──────────────────────────────────────────────────────────────────

export default function PrivacyPolicyLoading() {
  return (
    <div className="p-6">
      <PageHeaderSkeleton />

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px", alignItems: "start" }}>

        {/* Left column */}
        <div className="flex flex-col gap-4">

          {/* Banner card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <SectionHeaderSkeleton />
            <TwoColInputsSkeleton />
          </div>

          {/* General card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <SectionHeaderSkeleton />
            <TwoColInputsSkeleton />
            <StatusToggleSkeleton />
          </div>

          {/* Sections card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <SectionHeaderSkeleton />
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <SectionRowSkeleton key={i} idx={i} />
              ))}
            </div>
            {/* Add section button */}
            <div className="h-8 w-32 bg-gray-100 rounded-lg mt-3 animate-pulse" />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          <StatusCardSkeleton />
          <SummaryCardSkeleton />
          <SectionsNavCardSkeleton />
        </div>
      </div>
    </div>
  );
}