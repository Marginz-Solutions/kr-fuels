// Theme-matched skeleton shells for admin route-level loading.tsx files.
// Pure CSS (Tailwind `animate-pulse` over `bg-line`) so they paint instantly as
// the prefetched loading shell while the client page hydrates and fetches data.

// Header + form cards + save button (about / site-settings / calculator-settings).
export function SettingsFormSkeleton({
  maxWidth = 640,
  withHeaderAction = false,
  cards = [3],
}: {
  maxWidth?: number;
  withHeaderAction?: boolean;
  cards?: number[];
}) {
  return (
    <div className="animate-pulse" style={{ padding: 24, maxWidth }}>
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-[38px] w-[38px] shrink-0 rounded-[10px] bg-line" />
          <div className="space-y-2">
            <div className="h-4 w-44 rounded-full bg-line" />
            <div className="h-2.5 w-64 max-w-full rounded-full bg-line" />
          </div>
        </div>
        {withHeaderAction && <div className="h-9 w-32 rounded-full bg-line" />}
      </div>

      {cards.map((fields, ci) => (
        <div key={ci} className="mb-4 rounded-2xl border border-line bg-white p-[22px]">
          {Array.from({ length: fields }).map((_, fi) => (
            <div key={fi} className={fi === fields - 1 ? "" : "mb-4"}>
              <div className="mb-2 h-2.5 w-1/4 rounded-full bg-line" />
              <div className="h-10 w-full rounded-xl bg-line" />
            </div>
          ))}
        </div>
      ))}

      <div className="mt-[18px] h-10 w-36 rounded-full bg-line" />
    </div>
  );
}

// Header (+ action) over a list of row cards (journey).
export function ListPageSkeleton({
  maxWidth,
  rows = 4,
}: {
  maxWidth?: number;
  rows?: number;
}) {
  return (
    <div className="animate-pulse" style={{ padding: 24, maxWidth }}>
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-[38px] w-[38px] shrink-0 rounded-[10px] bg-line" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded-full bg-line" />
            <div className="h-2.5 w-56 max-w-full rounded-full bg-line" />
          </div>
        </div>
        <div className="h-9 w-36 rounded-full bg-line" />
      </div>

      <div className="flex flex-col gap-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start gap-3.5 rounded-2xl border border-line bg-white p-4">
            <div className="h-4 w-12 rounded-full bg-line" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 rounded-full bg-line" />
              <div className="h-2.5 w-3/4 rounded-full bg-line" />
            </div>
            <div className="h-7 w-7 rounded-lg bg-line" />
            <div className="h-7 w-7 rounded-lg bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Centered identity card (profile).
export function ProfileSkeleton() {
  return (
    <section className="mx-auto max-w-2xl animate-pulse p-6">
      <div className="h-5 w-28 rounded-full bg-line" />
      <div className="mt-2 h-3 w-64 max-w-full rounded-full bg-line" />

      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-line" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded-full bg-line" />
            <div className="h-3 w-56 max-w-full rounded-full bg-line" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-2.5 w-24 rounded-full bg-line" />
              <div className="h-3.5 w-32 rounded-full bg-line" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
          <div className="h-9 w-56 rounded-full bg-line" />
          <div className="h-9 w-28 rounded-full bg-line" />
        </div>
      </div>
    </section>
  );
}

// Category rail + header + filter row + responsive product card grid (products).
// Mirrors the real page layout (full-height left rail + scrolling grid) so there
// is no load→hydrate layout shift.
export function ProductsGridSkeleton({ cards = 9 }: { cards?: number }) {
  return (
    <div className="flex h-full min-h-0 animate-pulse bg-cream">
      {/* Category rail — desktop only */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-white">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <div className="h-4 w-4 rounded bg-line" />
          <div className="h-4 w-24 rounded-full bg-line" />
        </div>
        <div className="flex-1 space-y-1.5 p-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-xl bg-line" />
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded-full bg-line" />
            <div className="h-2.5 w-52 max-w-full rounded-full bg-line" />
          </div>
          <div className="h-9 w-32 rounded-full bg-line" />
        </div>

        <div className="mb-5 h-14 w-full rounded-2xl bg-white border border-line" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-white p-4">
              <div className="h-52 w-full rounded-xl bg-line" />
              <div className="mt-3.5 h-4 w-3/4 rounded-full bg-line" />
              <div className="mt-2 h-2.5 w-1/2 rounded-full bg-line" />
              <div className="mt-4 flex gap-2">
                <div className="h-8 flex-1 rounded-lg bg-line" />
                <div className="h-8 w-8 rounded-lg bg-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
