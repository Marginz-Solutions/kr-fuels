import { CenteredHeroSkeleton, Skeleton } from "@/components/Skeleton";

// Instant shell for the Contact page — hero + info column + enquiry form.
export default function ContactLoading() {
  return (
    <>
      <CenteredHeroSkeleton />
      <section className="container-x grid gap-8 py-16 lg:grid-cols-2">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 card-soft">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            </div>
          ))}
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[28rem] w-full rounded-2xl" />
      </section>
    </>
  );
}
