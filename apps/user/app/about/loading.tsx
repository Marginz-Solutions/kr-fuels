import { CenteredHeroSkeleton, Skeleton } from "@/components/Skeleton";

// Instant shell for the About page — hero + live counts + content blocks.
export default function AboutLoading() {
  return (
    <>
      <CenteredHeroSkeleton />
      <section className="container-x py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-soft text-center">
              <Skeleton className="mx-auto h-7 w-7 rounded-lg" />
              <Skeleton className="mx-auto mt-2 h-8 w-20" />
              <Skeleton className="mx-auto mt-2 h-4 w-28" />
            </div>
          ))}
        </div>
      </section>
      <section className="container-x pb-20">
        <div className="mx-auto max-w-3xl space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
