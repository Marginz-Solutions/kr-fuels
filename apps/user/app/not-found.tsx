import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <div className="text-6xl font-extrabold text-brand">404</div>
        <h1 className="mt-3 text-2xl font-bold text-ink">Page not found</h1>
        <p className="mt-2 text-ink/60">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    </section>
  );
}
