import { CenteredHeroSkeleton, CardSkeleton } from "@/components/Skeleton";

// Instant shell for the Privacy Policy page — hero + stacked policy sections.
export default function PrivacyLoading() {
  return (
    <>
      <CenteredHeroSkeleton />
      <section className="container-x py-16">
        <div className="mx-auto max-w-3xl space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} lines={4} />
          ))}
        </div>
      </section>
    </>
  );
}
