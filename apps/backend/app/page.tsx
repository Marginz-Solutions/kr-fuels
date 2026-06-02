export const dynamic = "force-static";

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem", lineHeight: 1.6 }}>
      <h1>KR Trans Fuels — Backend API</h1>
      <p>
        This service exposes the data API under <code>/api/v1/*</code>. It is the
        single source of truth consumed by the admin panel and the public
        website.
      </p>
      <ul>
        <li>
          <code>GET /api/v1/dashboard/fuel-prices</code> — current fuel prices
        </li>
        <li>
          <code>GET /api/v1/public/*</code> — read-only public endpoints for the
          website
        </li>
      </ul>
    </main>
  );
}
