// app/(dashboard)/seo-settings/loading.tsx

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

const FieldSkeleton = ({ textarea = false }: { textarea?: boolean }) => (
  <div className="mb-5 animate-pulse">
    <div className="h-2.5 w-1/4 bg-gray-100 rounded-full mb-2" />
    <div className={`w-full bg-gray-100 rounded-lg ${textarea ? "h-24" : "h-9"}`} />
    {/* char bar */}
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-0.5 bg-gray-100 rounded-full" />
      <div className="h-2.5 w-20 bg-gray-100 rounded-full" />
    </div>
  </div>
);

const KeywordsSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex gap-2 mb-3">
      <div className="flex-1 h-9 bg-gray-100 rounded-lg" />
      <div className="w-16 h-9 bg-gray-100 rounded-lg" />
    </div>
    <div className="flex flex-wrap gap-2">
      {[72, 90, 64, 82].map((w, i) => (
        <div key={i} className="h-6 bg-gray-100 rounded-full" style={{ width: w }} />
      ))}
    </div>
  </div>
);

const OgImageSkeleton = () => (
  <div className="w-full h-28 bg-gray-100 rounded-xl animate-pulse" />
);

const ScoreSidebarSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-6">
    {/* Ring + label */}
    <div className="flex items-center gap-3.5 mb-5 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/5 bg-gray-100 rounded-full" />
        <div className="h-2.5 w-4/5 bg-gray-100 rounded-full" />
      </div>
    </div>
    {/* Checklist rows */}
    <div className="space-y-3 animate-pulse">
      {[55, 70, 60, 75, 50, 65].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-gray-100 shrink-0" />
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
        <div className="h-4 w-40 bg-gray-200 rounded-full" />
        <div className="h-2.5 w-52 bg-gray-100 rounded-full" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-9 w-32 bg-gray-100 rounded-xl" />
      <div className="h-9 w-32 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

// ─── Loading ──────────────────────────────────────────────────────────────────

export default function SeoSettingsLoading() {
  return (
    <div className="p-6">
      <PageHeaderSkeleton />

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 280px", alignItems: "start" }}>
        {/* Left column */}
        <div className="flex flex-col gap-4">

          {/* Title & Description card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <SectionHeaderSkeleton />
            <FieldSkeleton />
            <FieldSkeleton textarea />
          </div>

          {/* Keywords card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <SectionHeaderSkeleton />
            <KeywordsSkeleton />
          </div>

          {/* OG Image card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <SectionHeaderSkeleton />
            <OgImageSkeleton />
          </div>
        </div>

        {/* Right: score sidebar */}
        <ScoreSidebarSkeleton />
      </div>
    </div>
  );
}