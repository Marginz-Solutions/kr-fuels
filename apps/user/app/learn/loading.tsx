import { CenteredHeroSkeleton, Skeleton } from "@/components/Skeleton";

// Instant shell for the Learn page — hero + comparison table + calculators + FAQ.
export default function LearnLoading() {
  return (
    <>
      <CenteredHeroSkeleton />
      <section className="container-x py-16">
        <Skeleton className="mx-auto mb-6 h-9 w-80" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </section>
      <section className="bg-cream py-16">
        <div className="container-x">
          <Skeleton className="mx-auto mb-8 h-9 w-96 max-w-full" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </section>
      <section className="container-x py-16">
        <Skeleton className="mx-auto mb-8 h-9 w-96 max-w-full" />
        <div className="mx-auto max-w-3xl space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </>
  );
}
