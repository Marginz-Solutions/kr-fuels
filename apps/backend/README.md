# @kr/backend — KR Trans Fuels API

Next.js 16, **API only**. The `app/api/v1/*` route handlers talk to Firebase /
Firestore / Google Cloud Storage via `firebase-admin`. This is the single source of
truth consumed by both the admin panel and the public website.

Dev port: **4000**.

## Auth model (session cookie)

Login flow: the front-end signs in with the Firebase **client** SDK, gets an `idToken`,
and POSTs it to `POST /api/v1/auth/session`. That handler mints a Firebase **session
cookie** named `session` and sets it on the response. Every protected route validates it
with `adminAuth.verifySessionCookie(session, true)`.

Because the API is a separate origin from the front-ends, the cookie must be readable
cross-origin:

- **Dev:** admin `localhost:3000`, user `localhost:3000`, api `localhost:4000` are all
  the same site (`localhost`; ports are ignored for cookie scope), so a `SameSite=Lax`
  host cookie set by the API is sent to the front-ends. CORS echoes the front-end origins
  with `Access-Control-Allow-Credentials: true` (see `proxy.ts`), and the front-ends use
  `credentials: "include"`.
- **Prod (preferred):** deploy under one parent domain — e.g. `admin.krfuels.com`,
  `krfuels.com`, `api.krfuels.com` — and set the session cookie with
  `Domain=.krfuels.com` (`COOKIE_DOMAIN=.krfuels.com`) so all subdomains share it.
  Set `ADMIN_ORIGIN`/`USER_ORIGIN` to the real origins.

> **Deploy assumption:** the cookie-domain approach above. If the apps must live on
> unrelated domains, switch `auth/session` to issue a bearer token the front-ends attach
> on each request instead.

## CORS

`proxy.ts` (Next.js 16 middleware) handles preflight (`OPTIONS → 204`) and adds
`Access-Control-Allow-*` headers to `/api/*`, echoing only `ADMIN_ORIGIN` / `USER_ORIGIN`
(plus localhost dev origins).

## Public (website) endpoints

Read-only, unauthenticated `GET` endpoints for the website live under
`app/api/v1/public/*`. All writes remain session-protected.

## Env

See `.env.example`. `FIREBASE_ADMIN_PRIVATE_KEY` is the service-account key with literal
`\n` newlines, wrapped in quotes.
