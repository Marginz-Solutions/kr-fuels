# @kr/admin — KR Trans Fuels admin panel

Next.js 16 (App Router) UI only — **no API routes**. Every client/server fetch goes to
the backend via `NEXT_PUBLIC_API_BASE_URL`. Runs on **3000**.

## Auth

Firebase **client** SDK sign-in → posts the idToken to the backend
`POST /api/v1/auth/session` (with `credentials: "include"`) which sets the `session`
cookie. `proxy.ts` guards `(protected)` routes by checking that cookie.

## Content surfaces

Dashboard, Clients, Stations (+ images), Products (incl. `external_url`), Testimonials,
FAQ, About Us, Our Journey, Contact (feedback / form submissions / contact details),
Site Settings, Calculators, SEO Settings, Privacy Policy — all backed by Firestore via
the backend.

## Env

`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_FIREBASE_*` (client auth), `COOKIE_DOMAIN`.
See `.env.example`.
