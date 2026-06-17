import { CenteredHeroSkeleton, Skeleton, CardGridSkeleton } from "@/components/Skeleton";

// Instant shell for the stations listing — hero + filter bar + station card grid.
export default function StationsLoading() {
  return (
    <>
      <CenteredHeroSkeleton />
      <section className="container-x py-14">
        <div className="mb-6 flex flex-wrap gap-3">
          <Skeleton className="h-11 flex-1 min-w-[200px] rounded-full" />
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
        <CardGridSkeleton count={9} />
      </section>
    </>
  );
}
