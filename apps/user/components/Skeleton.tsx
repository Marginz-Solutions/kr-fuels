// Theme-matched skeleton primitives for route-level loading.tsx shells.
// Pure CSS (Tailwind `animate-pulse`) — no client JS, so these render instantly
// as part of the prefetched loading shell while the real page streams in.

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <span aria-hidden style={style} className={`block animate-pulse rounded-lg bg-line ${className}`} />;
}

// Centered hero band used by /stations, /learn, /contact, /privacy, /about.
export function CenteredHeroSkeleton() {
  return (
    <section className="bg-linear-to-b from-brand-pale/60 to-white">
      <div className="container-x py-14 text-center">
        <Skeleton className="mx-auto h-7 w-32 rounded-full" />
        <Skeleton className="mx-auto mt-5 h-11 w-3/4 max-w-xl" />
        <Skeleton className="mx-auto mt-5 h-5 w-2/3 max-w-lg" />
      </div>
    </section>
  );
}

// Soft card placeholder mirroring `.card-soft`.
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card-soft">
      <Skeleton className="h-5 w-1/2" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3.5" style={{ width: `${90 - i * 12}%` }} />
        ))}
      </div>
    </div>
  );
}

// Two-column product hero + content, shared by /products and /lubricants.
export function ProductScreenSkeleton() {
  return (
    <>
      <section className="bg-linear-to-b from-brand-pale/60 to-white">
        <div className="container-x py-12 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="mt-4 h-11 w-3/4" />
              <Skeleton className="mt-5 h-5 w-5/6" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-3 h-4 w-2/3" />
              <div className="mt-7 flex gap-3">
                <Skeleton className="h-12 w-40 rounded-full" />
                <Skeleton className="h-12 w-40 rounded-full" />
              </div>
            </div>
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          </div>
        </div>
      </section>
      <section className="container-x py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} lines={4} />
          ))}
        </div>
      </section>
    </>
  );
}

// Grid of card placeholders for listing/explorer pages.
export function CardGridSkeleton({
  count = 6,
  cols = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-soft">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="mt-4 h-4 w-3/4" />
          <Skeleton className="mt-2.5 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
