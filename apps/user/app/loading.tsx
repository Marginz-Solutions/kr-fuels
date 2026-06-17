import { Skeleton, CardSkeleton } from "@/components/Skeleton";

// Instant route shell for the home page — paints the chrome immediately while
// the data-driven hero, stats and testimonials stream in.
export default function HomeLoading() {
  return (
    <>
      <section className="bg-linear-to-b from-brand-pale/60 to-white">
        <div className="container-x grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <Skeleton className="h-8 w-72 rounded-full" />
            <Skeleton className="mt-6 h-16 w-full" />
            <Skeleton className="mt-3 h-16 w-4/5" />
            <Skeleton className="mt-6 h-5 w-3/4" />
            <div className="mt-8 flex gap-3">
              <Skeleton className="h-12 w-52 rounded-full" />
              <Skeleton className="h-12 w-48 rounded-full" />
            </div>
          </div>
          <Skeleton className="mx-auto aspect-[4/3] w-full max-w-xl rounded-[28px]" />
        </div>
        <div className="container-x pb-14">
          <Skeleton className="h-28 w-full rounded-3xl" />
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-x grid grid-cols-2 gap-8 py-14 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="mx-auto h-12 w-24" />
              <Skeleton className="mx-auto mt-2 h-4 w-32" />
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} lines={2} />
          ))}
        </div>
      </section>
    </>
  );
}
